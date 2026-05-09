import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface ScrapedJob {
  id: string;
  title: string;
  link: string;
  location?: string;
}

/**
 * Ordered list of CSS selectors used to find job listing containers.
 * Each entry is tried in sequence; the first one yielding 3+ results wins.
 * This covers Greenhouse, Lever, Ashby, Workday, and generic job boards.
 */
const JOB_CONTAINER_SELECTORS = [
  // Greenhouse
  '.opening',
  '.job-post',
  // Lever
  '.posting',
  '.lever-job-listing',
  // Ashby
  '[data-testid="job-listing-item"]',
  '.ashby-job-posting-brief',
  // Workday / iCIMS / generic ATSes
  '[data-automation-id="jobItem"]',
  '[class*="job-card"]',
  '[class*="jobCard"]',
  '[class*="JobCard"]',
  '[class*="job-listing"]',
  '[class*="jobListing"]',
  '[class*="job-result"]',
  '[class*="jobResult"]',
  '[class*="position-"]',
  // Generic list items that contain a job link
  'li:has(a[href*="job"]), li:has(a[href*="position"]), li:has(a[href*="career"])',
  // Table rows (some boards use tables)
  'tr:has(a[href*="job"]), tr:has(a[href*="position"])',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

/**
 * Selectors for the job title within a container element.
 */
const TITLE_SELECTORS = [
  'h1', 'h2', 'h3', 'h4',
  '[class*="title"]',
  '[class*="Title"]',
  '[class*="position"]',
  '[class*="role"]',
  'a',
];

/**
 * Selectors for the location within a container element.
 */
const LOCATION_SELECTORS = [
  '[class*="location"]',
  '[class*="Location"]',
  '[data-qa="job-location"]',
  '[class*="city"]',
  'span',
];

function makeAbsolute(href: string, base: string): string {
  if (!href) return '';
  try {
    return new URL(href, base).toString();
  } catch {
    return '';
  }
}

function scoreTitle(text: string): number {
  // Boost job-like titles, penalise navigation/footer noise
  const t = text.toLowerCase().trim();
  if (t.length < 3 || t.length > 150) return 0;
  const bad = ['cookie', 'privacy', 'terms', 'login', 'sign in', 'menu', 'home', 'about', 'contact', 'skip', 'back'];
  if (bad.some(b => t.includes(b))) return 0;
  return 1;
}

export interface ScrapeResult {
  jobs: ScrapedJob[];
  blocked: boolean;
  status?: number;
}

export async function scrapeJobs(url: string, expandedTerms: string[] = []): Promise<ScrapeResult> {
  // ── 1. Fetch HTML ─────────────────────────────────────────────────────────
  let html: string;
  try {
    // Rotate through realistic User-Agent strings to avoid bot detection
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const origin = new URL(url).origin;

    const res = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': origin + '/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(20000),
      redirect: 'follow',
    });

    if (!res.ok) {
      const status = res.status;
      console.error(`[scraper] HTTP ${status} for`, url);
      return { jobs: [], blocked: status === 403 || status === 401 || status === 429, status };
    }
    html = await res.text();
  } catch (err) {
    console.error('[scraper] Fetch failed:', url, err);
    return { jobs: [], blocked: false };
  }

  const $ = cheerio.load(html);
  const baseUrl = new URL(url).origin;
  const jobs: ScrapedJob[] = [];
  const seenIds = new Set<string>();

  // ── 1.5 Deep Inspection: Check for embedded JSON data (SPA Support) ──────
  // This handles Ashby, Greenhouse/Lever JSON-LD, and Next.js data blobs
  $('script').each((_, el) => {
    const content = $(el).html() || '';
    
    // Pattern A: Ashbyhq window.__appData
    if (content.includes('window.__appData')) {
      try {
        const jsonMatch = content.match(/window\.__appData\s*=\s*({[\s\S]*?});/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          const postings = data.jobBoard?.jobPostings || [];
          postings.forEach((p: any) => {
            // Ashby links are usually https://jobs.ashbyhq.com/{org}/{id}
            const orgName = data.organization?.hostedJobsPageSlug || data.organization?.name?.toLowerCase().replace(/\s+/g, '');
            const jobLink = p.id ? `https://jobs.ashbyhq.com/${orgName}/${p.id}` : '';
            if (p.title && jobLink) {
              const id = crypto.createHash('md5').update(p.title + jobLink).digest('hex');
              if (!seenIds.has(id)) {
                seenIds.add(id);
                jobs.push({
                  id,
                  title: p.title,
                  link: jobLink,
                  location: p.locationName || p.departmentName
                });
              }
            }
          });
        }
      } catch (e) {
        console.error('[scraper] Ashby JSON parse failed', e);
      }
    }

    // Pattern B: JSON-LD (Common for SEO)
    if ($(el).attr('type') === 'application/ld+json') {
      try {
        const data = JSON.parse(content);
        // Handle single object or array
        const items = Array.isArray(data) ? data : [data];
        items.forEach(item => {
          // Schema.org JobPosting
          if (item['@type'] === 'JobPosting' || item.type === 'JobPosting') {
            const title = item.title || item.name;
            const link = item.url || url; // Fallback to current URL if individual link missing
            if (title && link) {
              const absLink = makeAbsolute(link, url);
              const id = crypto.createHash('md5').update(title + absLink).digest('hex');
              if (!seenIds.has(id)) {
                seenIds.add(id);
                jobs.push({
                  id,
                  title,
                  link: absLink,
                  location: item.jobLocation?.address?.addressLocality
                });
              }
            }
          }
        });
      } catch (e) {}
    }
  });

  // If we found a significant number of jobs via JSON, we can skip CSS selectors
  if (jobs.length >= 2) {
    return filterAndReturn(jobs, expandedTerms);
  }

  // ── 2. Try structured selectors ───────────────────────────────────────────
  let foundViaSelectors = false;
  for (const selector of JOB_CONTAINER_SELECTORS) {
    let elements: ReturnType<typeof $>;
    try {
      elements = $(selector);
    } catch {
      continue;
    }

    if (elements.length < 2) continue; // Not enough hits — try next selector

    elements.each((_, el) => {
      const container = $(el);

      // Find title
      let title = '';
      for (const tSel of TITLE_SELECTORS) {
        const candidate = container.find(tSel).first().text().trim();
        if (candidate && scoreTitle(candidate)) {
          title = candidate.split('\n')[0].trim();
          break;
        }
      }
      if (!title) {
        title = container.text().trim().split('\n')[0].trim();
      }
      if (!scoreTitle(title)) return;

      // Find link
      const anchor = container.is('a') ? container : container.find('a').first();
      const href = makeAbsolute(anchor.attr('href') || '', url);
      if (!href) return;

      // Find location
      let location = '';
      for (const lSel of LOCATION_SELECTORS) {
        const candidate = container.find(lSel).first().text().trim();
        if (candidate && candidate !== title && candidate.length < 80) {
          location = candidate;
          break;
        }
      }

      const id = crypto.createHash('md5').update(title + href).digest('hex');
      if (seenIds.has(id)) return;
      seenIds.add(id);

      jobs.push({ id, title, link: href, location: location || undefined });
    });

    if (jobs.length >= 2) {
      foundViaSelectors = true;
      break;
    }
    // Reset for next selector attempt
    jobs.length = 0;
    seenIds.clear();
  }

  // ── 3. Fallback: scan all anchors ─────────────────────────────────────────
  if (!foundViaSelectors) {
    $('a').each((_, el) => {
      const anchor = $(el);
      const href = anchor.attr('href') || '';
      const text = anchor.text().trim().split('\n')[0].trim();

      // Only anchors whose href looks like a job link
      const jobLinkPatterns = ['/job', '/position', '/career', '/opening', '/role', '/vacancy', '/jobs/', '/posting'];
      const looksLikeJobLink = jobLinkPatterns.some(p => href.toLowerCase().includes(p));

      if (!looksLikeJobLink || !scoreTitle(text)) return;

      const absHref = makeAbsolute(href, url);
      if (!absHref) return;

      const id = crypto.createHash('md5').update(text + absHref).digest('hex');
      if (seenIds.has(id)) return;
      seenIds.add(id);

      jobs.push({ id, title: text, link: absHref, location: undefined });
    });
  }

  // ── 4. Filter by search terms ─────────────────────────────────────────────
  return filterAndReturn(jobs, expandedTerms);
}

/**
 * Shared filtering logic to keep the main scraper clean.
 */
function filterAndReturn(jobs: ScrapedJob[], expandedTerms: string[]): ScrapeResult {
  if (expandedTerms.length === 0) {
    return { jobs: jobs.slice(0, 100), blocked: false };
  }

  const lowerTerms = expandedTerms.map(t => t.toLowerCase());
  const filtered = jobs.filter(j =>
    lowerTerms.some(term => j.title.toLowerCase().includes(term))
  );

  // If the filter removed everything (terms too strict), return all and let the
  // user know via the count — better to return too much than nothing.
  return { jobs: (filtered.length > 0 ? filtered : jobs).slice(0, 100), blocked: false };
}

