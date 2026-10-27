
import type { NextConfig } from "next";

const basePath = '/202609';
const nextConfig: NextConfig = {
  basePath,
  // assetPrefix defaults to basePath, no need to set separately
  // add trailingSlash: true only if your .htaccess expects trailing slashes consistently
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
