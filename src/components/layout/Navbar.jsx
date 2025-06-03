// src/components/layout/Navbar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth() || {};

  // 檢查是否在登入或註冊頁面（這些頁面不顯示導航欄）
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                  <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                  <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-800">國小漢字學習</span>
            </Link>
          </div>

          {/* 桌面選單 */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              href="/characters" 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                pathname === '/characters' 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              單字查詢
            </Link>
            <Link 
              href="/characters/practice" 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                pathname === '/practice' 
                  ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              寫字練習
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  pathname === '/admin' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                管理介面
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center ml-4">
                <span className="text-sm text-gray-700 mr-2">{user.email}</span>
                <button 
                  onClick={logout}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  登出
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-400 to-green-400 text-white hover:from-blue-500 hover:to-green-500"
              >
                登入
              </Link>
            )}
          </div>

          {/* 行動裝置選單按鈕 */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 行動裝置選單 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-3 px-4">
          <div className="space-y-1">
            <Link
              href="/characters"
              className={`block px-4 py-2 rounded-xl text-sm font-medium ${
                pathname === '/characters' 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              單字查詢
            </Link>
            <Link
              href="/characters/practice"
              className={`block px-4 py-2 rounded-xl text-sm font-medium ${
                pathname === '/practice' 
                  ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              寫字練習
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`block px-4 py-2 rounded-xl text-sm font-medium ${
                  pathname === '/admin' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                管理介面
              </Link>
            )}
            
            {user ? (
              <div className="pt-2 pb-1">
                <p className="text-sm text-gray-700 px-4 py-1">{user.email}</p>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-1 block w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  登出
                </button>
              </div>
            ) : (
              <Link 
                href="/ogin"
                className="block px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-400 to-green-400 text-white hover:from-blue-500 hover:to-green-500"
                onClick={() => setIsMenuOpen(false)}
              >
                登入
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}