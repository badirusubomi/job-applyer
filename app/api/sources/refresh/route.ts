import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { getProvider, AIModelType } from '@/lib/ai/index';

export async function POST(req: Request) {
  try {
    const { url, searchTerms, model, apiKey } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    let expandedTerms: string[] = [];
    if (searchTerms) {
      if (model && apiKey) {
        try {
          const aiProvider = getProvider(model as AIModelType, apiKey);
          expandedTerms = await aiProvider.expandSearchTerms(searchTerms);
        } catch (e) {
          console.error("AI expansion failed, falling back to raw terms", e);
          expandedTerms = searchTerms.split(',').map((s: string) => s.trim());
        }
      } else {
        expandedTerms = searchTerms.split(',').map((s: string) => s.trim());
      }
    }

    const scrapedJobs = await scrapeJobs(url, expandedTerms);
    
    return NextResponse.json({ success: true, jobs: scrapedJobs });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh source' }, { status: 500 });
  }
}
