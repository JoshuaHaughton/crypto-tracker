const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "assets.coingecko.com",
      "cryptocompare.com",
      "resources.cryptocompare.com",
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  async rewrites() {
    return [
      {
        source: "/app/:path*", // Catch all routes starting with /app/
        destination: "/spa/:path*", // Route these requests to the /spa/ folder
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
