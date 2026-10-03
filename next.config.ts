import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['*.e2b.app', 'localhost:3000'],
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
