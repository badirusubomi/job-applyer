import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const profilePath = path.join(process.cwd(), 'data', 'profile.md');

export async function GET() {
  try {
    const data = await fs.readFile(profilePath, 'utf8');
    return NextResponse.json({ content: data });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ content: '' }); // Return empty if not created yet
    }
    return NextResponse.json({ error: 'Failed to read profile' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    await fs.mkdir(path.dirname(profilePath), { recursive: true });
    await fs.writeFile(profilePath, content, 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to write profile' }, { status: 500 });
  }
}
