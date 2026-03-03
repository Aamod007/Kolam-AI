/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gcphodfadkaizxrrprjs.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    return config;
  },
  turbopack: {}
};

export default nextConfig;