import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "smartdine-v3.fra1.digitaloceanspaces.com",
        port: "",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "imageproxy.wolt.com",
        port: "",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
