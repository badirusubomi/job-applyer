import { NextResponse } from 'next/server';
import { getProvider, AIModelType } from '@/lib/ai/index';

export async function POST(req: Request) {
  try {
    // Load the library contextually
    const pdf = require('pdf-parse');
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
    try {
      // Use the PDFParse class available in version 2.4.5
      const PDFParser = pdf.PDFParse;
      
      if (!PDFParser) {
        throw new Error('PDFParse class not found in library');
      }

      const parser = new PDFParser({ data: buffer });
      const parsedData = await parser.getText();
      rawText = parsedData.text || '';
      
      // Clean up
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    } catch (err: any) {
      console.error('PDF Text Extraction Error:', err);
      return NextResponse.json({ 
        error: 'Failed to extract text from PDF. Ensure it is not password protected or corrupted.' 
      }, { status: 500 });
    }

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ error: 'Could not extract any text from the provided PDF.' }, { status: 400 });
    }

    // Pass to AI Provider to extract structured profile
    const provider = getProvider(model as AIModelType, apiKey);
    const profileJson = await provider.extractProfile(rawText);

    return NextResponse.json(profileJson);
  } catch (error: any) {
    console.error('Profile parsing handler error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during profile parsing' }, { status: 500 });
  }
}
