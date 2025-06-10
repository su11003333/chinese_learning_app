// src/app/layout.tsx
import { Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ReactNode } from 'react';
import Script from 'next/script';

// 使用可愛風格的字體
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata = {
  title: '國小漢字學習',
  description: '幫助家長追蹤孩子的漢字學習進度',
  keywords: ['國小', '漢字學習', '中文學習', '教育', '親子學習', '注音符號'],
  authors: [{ name: '國小漢字學習團隊' }],
  creator: '國小漢字學習',
  openGraph: {
    title: '國小漢字學習',
    description: '幫助家長追蹤孩子的漢字學習進度',
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: '國小漢字學習',
    description: '幫助家長追蹤孩子的漢字學習進度',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#EC4899'
      }
    ]
  },
  manifest: '/site.webmanifest',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#EC4899'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW" className={nunito.variable}>
      <body className="font-sans bg-gray-50">
        {/* Pinyin Pro 腳本 */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js"
          strategy="beforeInteractive"
        />
        
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        
        {/* Google Analytics */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}