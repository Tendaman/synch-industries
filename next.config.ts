import type { NextConfig } from "next";
import "./src/lib/delExpCodes"; // Import the cleanup job
import "./src/lib/dupDataToHistory"
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,   // Ignores TypeScript errors during production builds
  },
  eslint: {
    ignoreDuringBuilds: true,  // Ignores ESLint errors during production builds
  },
  reactStrictMode: true, // Enable React strict mode
  swcMinify: true, // Use SWC for faster minification
};

export default nextConfig;
