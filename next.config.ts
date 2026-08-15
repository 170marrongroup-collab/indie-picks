import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pics.dmm.co.jp",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "doujin-assets.dmm.co.jp",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
