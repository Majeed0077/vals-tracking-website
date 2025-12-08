import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["picsum.photos"], // allow external placeholder images
  },
};

export default nextConfig;
