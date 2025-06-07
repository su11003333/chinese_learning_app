import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除任何 Vercel 或有問題的配置
  
  // Cloudflare Pages 圖片優化
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
  
  // 實驗性功能（只包含確定支援的）
  experimental: {
    // 移除 runtime 設定，因為不是有效屬性
    // forceSwcTransforms: true, // 如果需要的話
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