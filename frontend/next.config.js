// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_API_URL:   process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL:  process.env.NEXT_PUBLIC_BASE_URL,
  },
};
module.exports = nextConfig;
