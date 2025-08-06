/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 本番ビルド時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視（必要に応じて）
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Optimize production builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig