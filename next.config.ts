import type { NextConfig } from 'next';

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ktrrjvapmaftznfxbwhi.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '39f7d44d627148aa5c1c8a4d790903db.cdn.bubble.io',
      },
    ],
  },
};

export default nextConfig;
