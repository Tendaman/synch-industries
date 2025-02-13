import type { NextConfig } from "next";
import "./src/lib/delExpCodes"; // Import the cleanup job
import "./src/lib/dupDataToHistory"
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode
  swcMinify: true, // Use SWC for faster minification
};

export default nextConfig;
