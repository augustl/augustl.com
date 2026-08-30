import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
