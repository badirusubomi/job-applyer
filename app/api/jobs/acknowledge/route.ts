import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    const stmt = db.prepare('UPDATE jobs SET is_new = 0 WHERE is_new = 1');
    const info = stmt.run();
    
    return NextResponse.json({ 
      success: true, 
      count: info.changes 
    });
  } catch (error) {
    console.error('Acknowledge error:', error);
    return NextResponse.json({ error: 'Failed to acknowledge jobs' }, { status: 500 });
  }
}
