/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  ...nextConfig,
  images: {
    domains: ['assets.coingecko.com']
  },
  devIndicators: {
    buildActivity: false
}
}
