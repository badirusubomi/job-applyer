import { NextResponse } from 'next/server';
const pdf = require('pdf-parse');
import { getProvider, AIModelType } from '@/lib/ai/index';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const model = formData.get('model') as string;
    const apiKey = formData.get('apiKey') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!model || !apiKey) {
      return NextResponse.json({ error: 'AI Model and API Key are required for extraction' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract raw text from PDF
    let rawText = '';
    if (pdf.PDFParse) {
      const parser = new pdf.PDFParse({ data: buffer });
      const parsedData = await parser.getText();
      rawText = parsedData.text;
      await parser.destroy();
    } else {
      const parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
      const parsedData = await parsePdf(buffer);
      rawText = parsedData.text;
    }

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // Pass to AI Provider to extract structured profile
    const provider = getProvider(model as AIModelType, apiKey);
    const profileJson = await provider.extractProfile(rawText);

    return NextResponse.json(profileJson);
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse PDF' }, { status: 500 });
  }
}
