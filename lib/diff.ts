import { ScrapedJob } from './scraper';

export interface Job {
  id: string;
  source_id: string;
  title: string;
  link: string;
  location: string | null;
  first_seen: string;
  is_new: boolean;
  applied: boolean;
}

export function diffJobs(existingJobs: Job[], scrapedJobs: ScrapedJob[], sourceId: string): Job[] {
  const existingIds = new Set(existingJobs.map(j => j.id));
  const newJobs: Job[] = [];

  for (const job of scrapedJobs) {
    if (!existingIds.has(job.id)) {
      newJobs.push({
        id: job.id,
        source_id: sourceId,
        title: job.title,
        link: job.link,
        location: job.location || null,
        first_seen: new Date().toISOString(),
        is_new: true,
        applied: false
      });
      existingIds.add(job.id); // Prevent intra-run duplicates if any
    }
  }

  return newJobs;
}
