import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@habit-tracker/lib', '@habit-tracker/types', '@habit-tracker/ui'],
}

export default nextConfig
