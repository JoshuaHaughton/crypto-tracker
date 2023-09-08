const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withPreact = require("next-plugin-preact");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = withPreact(
  withBundleAnalyzer({
    ...nextConfig,
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
  }),
);
