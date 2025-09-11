/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
  domains: ['gcphodfadkaizxrrprjs.supabase.co', 'lh3.googleusercontent.com'],
  },
}

export default nextConfig
