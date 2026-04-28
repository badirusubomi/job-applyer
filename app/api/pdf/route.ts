import { NextResponse } from 'next/server';
import { renderTemplate } from '@/lib/template';
import { generatePDF } from '@/lib/pdf';

export async function POST(req: Request) {
  try {
    const { type, templateName = 'modern', data, fontConfig } = await req.json();

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    // Support both resume and cover-letter
    const finalType = type === 'resume' ? 'resume' : 'cover-letter';
    
    // Render HTML
    const html = await renderTemplate(finalType, templateName, data, fontConfig);
    
    // Generate PDF
    const pdfBuffer = await generatePDF(html);

    // Return as PDF download or preview stream
    return new Response(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${finalType}_unlocked.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
