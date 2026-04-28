/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx'],
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '8080' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'wallpaper.dog' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  output: 'standalone',   // Enables Docker standalone build
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Allow cross-origin requests to backend in dev
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [{ source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' }]
      : [];
  },
};

module.exports = nextConfig;
