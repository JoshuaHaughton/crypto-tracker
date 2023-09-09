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
};

module.exports = withBundleAnalyzer(nextConfig);
