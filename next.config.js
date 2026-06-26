/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'openweathermap.org' },
      // Supabase Storage — works for any project URL
      { protocol: 'https', hostname: '*.supabase.co' },
      // NewsAPI images
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      // Generic fallback for news article images
      { protocol: 'https', hostname: '*' },
    ],
  },
  // Suppress specific known non-critical warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}
module.exports = nextConfig
