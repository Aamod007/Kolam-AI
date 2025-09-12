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


export default {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  images: {
    domains: ['gcphodfadkaizxrrprjs.supabase.co', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    return config;
  },
}