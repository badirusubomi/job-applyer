import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' blob: data:;
  font-src 'self' https://cdn.jsdelivr.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  worker-src 'self' blob:;
  frame-ancestors 'none';
  connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://cdn.jsdelivr.net;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
