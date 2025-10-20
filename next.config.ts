import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [], // Add any image domains you need
  },
  typescript: {
    // Report errors to build output
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    // Enable modern features
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typedRoutes: true,
};

export default nextConfig;
