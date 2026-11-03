
import type { NextConfig } from "next";

const basePath = '/k_sys';
const nextConfig: NextConfig = {
  basePath,
  // assetPrefix defaults to basePath, no need to set separately
  // add trailingSlash: true only if your .htaccess expects trailing slashes consistently
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  serverExternalPackages: ["bcrypt"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
