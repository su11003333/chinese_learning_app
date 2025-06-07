import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 針對 Cloudflare Pages 的優化配置
  
  // 圖片優化
  images: {
    unoptimized: true, // 簡化處理，避免複雜的 loader
  },
  
  // 輸出優化
  distDir: '.next', // 確保輸出目錄一致
  
  // 編譯優化 - 減少檔案大小
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Webpack 優化 - 重要：控制 chunk 大小
  webpack: (config, { isServer }) => {
    // 生產環境優化
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 20971520, // 20MB 限制
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 10485760, // 10MB
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              maxSize: 10485760, // 10MB
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              maxSize: 5242880, // 5MB
            },
          },
        },
      };
    }
    
    // 禁用快取以避免大檔案
    if (process.env.NODE_ENV === 'production') {
      config.cache = false;
    }
    
    return config;
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