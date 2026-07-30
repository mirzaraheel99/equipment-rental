import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@erms/ui', '@erms/localization'],
};

export default nextConfig;
