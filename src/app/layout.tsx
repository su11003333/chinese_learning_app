// src/app/layout.tsx (SEO 優化版)
import { Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ReactNode } from 'react';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

// 使用可愛風格的字體
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
});

// 結構化資料 (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "小字苗-國小漢字學習平台",
  "description": "專為國小學童設計的漢字學習系統，提供互動式練習、進度追蹤和家長監控功能",
  "url": "https://hanziplay.com",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TWD"
  },
  "creator": {
    "@type": "Organization",
    "name": "小字苗教學團隊"
  },
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "audienceType": "國小學童"
  },
  "educationalLevel": "elementary",
  "inLanguage": "zh-TW",
  "featureList": [
    "漢字練習",
    "注音符號學習",
    "進度追蹤",
    "家長監控",
    "互動式測驗"
  ]
};

export const metadata: Metadata = {
  // 基本 SEO
  title: {
    default: '小字苗-國小漢字學習平台 | 互動式中文學習系統',
    template: '%s | 小字苗-國小漢字學習平台'
  },
  description: '專為國小學童設計的漢字學習平台，提供互動式練習、注音符號教學、進度追蹤和家長監控。讓孩子在遊戲中快樂學習中文漢字，提升語文能力。',
  
  // 關鍵字優化
  keywords: [
    '國小漢字學習',
    '中文學習',
    '注音符號',
    '漢字練習',
    '國小中文',
    '親子學習',
    '線上教育',
    '互動式學習',
    '漢字教學',
    '小學中文',
    '繁體中文學習',
    '語文教育',
    '兒童教育',
    '數位學習',
    '學習追蹤'
  ],
  
  // 作者和創建者資訊
  authors: [{ name: '國小漢字學習團隊', url: 'https://hanziplay.com.com' }],
  creator: '小字苗教學團隊',
  publisher: '小字苗-國小漢字學習平台',
  
  // Open Graph (Facebook, Line 等社群媒體)
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://hanziplay.com.com',
    siteName: '小字苗-國小漢字學習平台',
    title: '小字苗-國小漢字學習平台 | 互動式中文學習系統',
    description: '專為國小學童設計的漢字學習平台，提供互動式練習、注音符號教學、進度追蹤和家長監控。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '小字苗-國小漢字學習平台',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 800,
        height: 800,
        alt: '小字苗-國小漢字學習平台',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    site: '@your_twitter_handle',
    creator: '@your_twitter_handle',
    title: '小字苗-國小漢字學習平台 | 互動式中文學習系統',
    description: '專為國小學童設計的漢字學習平台，提供互動式練習、注音符號教學、進度追蹤和家長監控。',
    images: ['/twitter-image.png'],
  },
  
  // 搜尋引擎指令
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 圖標配置
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#EC4899'
      }
    ]
  },
  
  // PWA 支持
  manifest: '/site.webmanifest',
  
  // 其他 SEO 設定
  alternates: {
    canonical: 'https://hanziplay.com.com',
    languages: {
      'zh-TW': 'https://hanziplay.com.com',
      'zh-CN': 'https://hanziplay.com.com/cn',
    },
  },
  
  // 驗證標籤 (需要時添加)
  verification: {
    google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  
  // 分類
  category: '教育',
};

// 視窗配置 (Next.js 15 新要求)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EC4899' },
    { media: '(prefers-color-scheme: dark)', color: '#BE185D' }
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW" className={nunito.variable}>
      <head>
        {/* 結構化資料 */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* 預載入重要資源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS 預解析 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* 安全性標頭 */}
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* 移動設備優化 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="小字苗" />
        
        {/* Microsoft 瓷磚 */}
        <meta name="msapplication-TileColor" content="#EC4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      
      <body className="font-sans bg-gray-50">
        {/* Pinyin Pro 腳本 */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js"
          strategy="beforeInteractive"
        />
        
        {/* 跳過導航連結 (無障礙) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          跳到主要內容
        </a>
        
        <AuthProvider>
          <Navbar />
          <main id="main-content" role="main">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        
        {/* Google Analytics */}
        <GoogleAnalytics />
        
        {/* 服務工作者註冊 (如果有 PWA) */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}