const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPreact = require('next-plugin-preact')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

}
module.exports = withBundleAnalyzer(withPreact({
  ...nextConfig,
  images: {
    domains: ['assets.coingecko.com']
  },
  devIndicators: {
    buildActivity: false
}
}))
