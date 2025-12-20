/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Add explicit webpack aliases for @ path
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    // Ensure proper module resolution with explicit extensions
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];

    return config;
  },
};

module.exports = nextConfig;
