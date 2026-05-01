import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
  img-src 'self' blob: data:;
  font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  worker-src 'self' blob:;
  frame-ancestors 'none';
  connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com;
`;

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
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
