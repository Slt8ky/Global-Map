import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  logging: { browserToTerminal: true },
  images: { unoptimized: true }
};

export default nextConfig;
