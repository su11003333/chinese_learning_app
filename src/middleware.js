// src/middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
  // 獲取 Firebase 認證 cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie; // 簡單檢查是否有 session cookie
  
  // 訪問路徑
  const { pathname } = request.nextUrl;

  // 需要認證的路徑
  const authRequiredPaths = ['/profile', '/dashboard', '/settings'];
  
  // 僅限未登入用戶的路徑
  const authNotRequiredPaths = ['/login', '/register'];

  // 檢查是否為需要認證的路徑
  if (authRequiredPaths.some(path => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 檢查是否為僅限未登入用戶的路徑
  if (authNotRequiredPaths.some(path => pathname.startsWith(path))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// 設定中間件匹配的路徑
export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register',
  ],
};