// src/app/layout.js
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';

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
  manifest: '/site.webmanifest'
};

export default function RootLayout({ children }:{children: React.ReactNode}) {
  return (
    <html lang="zh-TW" className={`${nunito.variable}`}>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js"></script>
      </head>
      <body className="font-sans bg-gray-50">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}