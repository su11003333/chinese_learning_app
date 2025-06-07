import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 特定配置
  images: {
    unoptimized: true, // Cloudflare Pages 需要
  },
  
  // 確保客戶端渲染的組件正常工作
  experimental: {
    esmExternals: true,
  },
  
  // 編譯配置
  compiler: {
    // 移除 console.log（生產環境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // 重定向配置（如果需要）
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/add-characters',
        permanent: false,
      },
    ]
  },
  
  // Headers 配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
};

export default nextConfig;