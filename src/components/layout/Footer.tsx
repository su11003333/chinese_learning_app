// src/components/layout/Footer.tsx
import Link from 'next/link';
import { FooterLogo, BRAND } from '@/constants/logo';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 公司資訊 */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <FooterLogo />
              <span className="font-bold text-lg">{BRAND.name}</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {BRAND.description}，讓每個孩子都能在快樂中學習中文。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 學習資源 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">學習資源</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cumulative-characters" className="text-gray-300 hover:text-white transition">
                  累積漢字表
                </Link>
              </li>
              <li>
                <Link href="/characters" className="text-gray-300 hover:text-white transition">
                  漢字查詢
                </Link>
              </li>
              <li>
                <Link href="/characters/practice" className="text-gray-300 hover:text-white transition">
                  寫字練習
                </Link>
              </li>
              <li>
                <Link href="/practice-sheet" className="text-gray-300 hover:text-white transition">
                  練習簿
                </Link>
              </li>
            </ul>
          </div>

          {/* 關於我們 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">關於我們</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  關於小字苗
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>

          {/* 法律資訊 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">法律資訊</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition">
                  隱私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition">
                  服務條款
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} {BRAND.fullName}. 版權所有.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>本網站使用 Google AdSense 提供廣告服務</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}