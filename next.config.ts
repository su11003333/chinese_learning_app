import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 適配器配置
  experimental: {
    runtime: 'edge', // 使用 Edge Runtime（可選）
  },
  
  // 圖片優化 - 使用 Cloudflare Images
  images: {
    loader: 'custom',
    loaderFile: './src/utils/cloudflare-image-loader.js',
  },
  
  // 編譯優化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/add-characters',
        permanent: false,
      },
    ]
  },
  
  // Security headers
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;