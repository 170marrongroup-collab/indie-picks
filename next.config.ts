import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // FANZA
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

      // Pcolle
      {
        protocol: "https",
        hostname: "img.pcolle.com",
        pathname: "/**",
      },

      // FC2
      {
        protocol: "https",
        hostname: "contents-thumbnail2.fc2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "contents-thumbnail1.fc2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "contents-thumbnail3.fc2.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
