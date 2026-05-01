import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// Note: This acts as a soft limit on serverless edge networks, but a hard limit on traditional Node deployments.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const LIMIT = 30; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window

export function proxy(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Background cleanup of old entries
    if (Math.random() < 0.05) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.timestamp < windowStart) {
          rateLimitMap.delete(key);
        }
      }
    }

    const record = rateLimitMap.get(ip);
    
    if (record && record.timestamp > windowStart) {
      if (record.count >= LIMIT) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests. Please slow down.' }),
          { status: 429, headers: { 'Retry-After': '60', 'Content-Type': 'application/json' } }
        );
      }
      record.count += 1;
      rateLimitMap.set(ip, record);
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
