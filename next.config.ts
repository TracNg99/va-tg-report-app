import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  images: {
    domains: [
      'kkhkvzjpcnivhhutxled.supabase.co',
      // Add any other image domains you might use
    ],
    remotePatterns: [
      // Placeholder image
      {
        hostname: 'picsum.photos',
        protocol: 'https',
        pathname: '/**',
        port: '',
        search: '',
      },
      // Add more domain here
    ],
  },
};

export default nextConfig;
