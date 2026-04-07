import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

export async function GET() {
  try {
    const sources = db.prepare('SELECT * FROM sources').all();
    const jobs = db.prepare('SELECT * FROM jobs').all();
    
    // Attach jobs to their corresponding source
    const result = sources.map((source: any) => ({
      ...source,
      jobs: jobs.filter((job: any) => job.source_id === source.id)
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, url } = await req.json();
    if (!name || !url) return NextResponse.json({ error: 'Missing name or url' }, { status: 400 });

    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO sources (id, name, url) VALUES (?, ?, ?)');
    stmt.run(id, name, url);

    const newSource = db.prepare('SELECT * FROM sources WHERE id = ?').get(id) as any;
    return NextResponse.json({ ...newSource, jobs: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}
