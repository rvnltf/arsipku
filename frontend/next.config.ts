import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  output: "standalone",

  async rewrites() {
    return [
      // Health check: /api/health -> /health
      {
        source: "/api/health",
        destination: `${backendUrl}/health`,
      },

      // Endpoint API lainnya tetap diteruskan
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
