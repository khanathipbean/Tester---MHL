import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 60,  // cache client-side navigations for 60s
      static: 300,  // cache static pages for 5 min
    },
  },
};

export default nextConfig;
