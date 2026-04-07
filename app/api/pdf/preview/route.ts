import { NextResponse } from 'next/server';
import { renderTemplate } from '@/lib/template';

export async function POST(req: Request) {
  try {
    const { type, templateName = 'modern', data } = await req.json();

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    const finalType = type === 'resume' ? 'resume' : 'cover-letter';
    const html = await renderTemplate(finalType, templateName, data);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error: any) {
    console.error('Preview Error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
