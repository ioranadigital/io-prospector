// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static generation for all app routes - generate on demand
  experimental: {
    isrMemoryCacheSize: 0,
  },
  onDemandEntries: {
    // Preload pages on demand
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  env: {
    NEXT_PUBLIC_API_URL:   process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL:  process.env.NEXT_PUBLIC_BASE_URL,
  },
};
module.exports = nextConfig;
