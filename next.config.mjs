/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    domains: ['gcphodfadkaizxrrprjs.supabase.co'],
  },
}

export default nextConfig
