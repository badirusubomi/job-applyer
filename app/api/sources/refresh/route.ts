import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { scrapeJobs } from '@/lib/scraper';
import { diffJobs, Job } from '@/lib/diff';
import { getProvider, AIModelType } from '@/lib/ai/index';

export async function POST(req: Request) {
  try {
    const { sourceId, model, apiKey } = await req.json();
    if (!sourceId) return NextResponse.json({ error: 'Missing sourceId' }, { status: 400 });

    const source = db.prepare('SELECT * FROM sources WHERE id = ?').get(sourceId) as any;
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    const existingJobs = db.prepare('SELECT * FROM jobs WHERE source_id = ?').all(sourceId) as Job[];
    
    let expandedTerms: string[] = [];
    if (source.search_terms) {
      if (model && apiKey) {
        try {
          const aiProvider = getProvider(model as AIModelType, apiKey);
          expandedTerms = await aiProvider.expandSearchTerms(source.search_terms);
        } catch (e) {
          console.error("AI expansion failed, falling back to raw terms", e);
          expandedTerms = source.search_terms.split(',').map((s: string) => s.trim());
        }
      } else {
        expandedTerms = source.search_terms.split(',').map((s: string) => s.trim());
      }
    }

    const scrapedJobs = await scrapeJobs(source.url, expandedTerms);
    
    // Process diff
    const newJobs = diffJobs(existingJobs, scrapedJobs, sourceId);

    if (newJobs.length > 0) {
      const insert = db.prepare(`
        INSERT INTO jobs (id, source_id, title, link, location, first_seen, is_new, applied) 
        VALUES (@id, @source_id, @title, @link, @location, @first_seen, @is_new, @applied)
      `);
      
      const insertMany = db.transaction((jobs: Job[]) => {
        for (const job of jobs) {
          insert.run({
            id: job.id,
            source_id: job.source_id,
            title: job.title,
            link: job.link,
            location: job.location,
            first_seen: job.first_seen,
            is_new: job.is_new ? 1 : 0,
            applied: job.applied ? 1 : 0
          });
        }
      });
      
      insertMany(newJobs);
    }

    return NextResponse.json({ success: true, newJobsCount: newJobs.length });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh source' }, { status: 500 });
  }
}
