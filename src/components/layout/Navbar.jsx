// src/components/layout/Navbar.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { BigLogo, BRAND } from '@/constants/logo';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth() || {};


  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 處理登出
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

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
            <div className="w-10 h-10 mr-2">   <BigLogo/></div>
           
              <span className="font-bold text-xl text-gray-800">{BRAND.name}</span>
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
              href="/cumulative-characters" 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                pathname === '/cumulative-characters' 
                  ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              累積漢字表
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
                <span className="text-sm text-gray-700 mr-3">{user.email}</span>
                
                {/* 下拉選單 */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* 下拉選單內容 */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {/* 管理員選項 */}
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/add-characters"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              新增漢字
                            </Link>
                            <Link
                              href="/admin/manage-characters"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              管理漢字
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        {/* 登出選項 */}
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          登出
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link 
                href="/login"
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
              <>
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
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  管理功能
                </div>
                <Link
                  href="/admin/add-characters"
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  新增漢字
                </Link>
                <Link
                  href="/admin/manage-characters"
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  管理漢字
                </Link>
              </>
            )}
            
            {user ? (
              <div className="pt-2 pb-1">
                <p className="text-sm text-gray-700 px-4 py-1">{user.email}</p>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-1 flex items-center w-full px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  登出
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
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