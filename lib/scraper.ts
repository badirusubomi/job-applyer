import { chromium } from 'playwright';
import crypto from 'crypto';

export interface ScrapedJob {
  id: string; // derived from link or title
  title: string;
  link: string;
  location?: string;
}

export async function scrapeJobs(url: string): Promise<ScrapedJob[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const jobs: ScrapedJob[] = [];
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for basic content to load
    await page.waitForTimeout(2000); 

    // Generic strategy: find all typical job links
    // This is a naive catch-all scraper for 'admin dashboard style' default behavior.
    const jobElements = await page.$$('a, div');
    
    // We try to collect hrefs that look like jobs or cards
    for (const el of jobElements) {
      const text = await el.innerText();
      const tagName = await el.evaluate(n => n.tagName.toLowerCase());
      
      if (text && text.length > 5 && text.length < 100) {
        // Quick heuristic: look for "engineer", "developer", "manager", "designer"
        const lowerText = text.toLowerCase();
        if (
          lowerText.includes('engineer') || 
          lowerText.includes('developer') || 
          lowerText.includes('designer') || 
          lowerText.includes('manager')
        ) {
          let link = '';
          if (tagName === 'a') {
            link = await el.getAttribute('href') || '';
          } else {
            // Find parent or child link
            const anchor = await el.$('a');
            if (anchor) link = await anchor.getAttribute('href') || '';
          }
          
          if (link) {
            // Format link to absolute
            if (link.startsWith('/')) {
              const urlObj = new URL(url);
              link = urlObj.origin + link;
            }
            
            const parsedTitle = text.trim().split('\n')[0];
            const id = crypto.createHash('md5').update(parsedTitle + link).digest('hex');
            
            // Check for duplicates in this run
            if (!jobs.find(j => j.id === id)) {
              jobs.push({
                id,
                title: text.trim().split('\n')[0], // Take first line as title
                link,
                location: 'Unknown'
              });
            }
          }
        }
      }
    }
    
  } catch (err) {
    console.error('Error scraping URL:', url, err);
  } finally {
    await browser.close();
  }

  return jobs;
}
