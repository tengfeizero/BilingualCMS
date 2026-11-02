import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "aka.doubaocdn.com" },
      { protocol: "http", hostname: "aka.doubaocdn.com" },
      { protocol: "https", hostname: "byteimg.com" },
      { protocol: "https", hostname: "*.byteimg.com" },
    ],
  },
};

export default nextConfig;
