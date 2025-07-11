// src/app/auth/line/callback/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function LineCallbackContent() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleLineCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // 檢查是否有錯誤
        if (error) {
          throw new Error(`LINE 登入錯誤: ${error}`);
        }

        // 檢查是否有授權碼
        if (!code) {
          throw new Error('未收到 LINE 授權碼');
        }

        // 檢查 state 參數（防CSRF攻擊）
        if (state !== 'random_state_string') {
          throw new Error('無效的 state 參數');
        }

        setStatus('exchanging');

        // 交換 access token
        const tokenResponse = await fetch('/api/auth/line/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          const tokenError = await tokenResponse.json();
          throw new Error(tokenError.error || 'Token 交換失敗');
        }

        const { accessToken } = await tokenResponse.json();

        setStatus('authenticating');

        // 使用 access token 進行 Firebase 認證
        const authResponse = await fetch('/api/auth/line', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });

        if (!authResponse.ok) {
          const authError = await authResponse.json();
          throw new Error(authError.error || 'Firebase 認證失敗');
        }

        const { customToken } = await authResponse.json();

        // 使用 custom token 登入 Firebase
        await signInWithCustomToken(auth, customToken);

        setStatus('success');

        // 檢查是否在彈出視窗中
        if (window.opener) {
          // 向父視窗發送成功消息
          window.opener.postMessage({
            type: 'LINE_LOGIN_SUCCESS',
            accessToken,
          }, window.location.origin);
          window.close();
        } else {
          // 重定向到原始頁面或首頁
          const returnUrl = sessionStorage.getItem('lineLoginReturnUrl') || '/';
          sessionStorage.removeItem('lineLoginReturnUrl');
          router.push(returnUrl);
        }

      } catch (error) {
        console.error('LINE 登入回調錯誤:', error);
        setError(error.message);
        setStatus('error');

        // 如果在彈出視窗中，向父視窗發送錯誤消息
        if (window.opener) {
          window.opener.postMessage({
            type: 'LINE_LOGIN_ERROR',
            error: error.message,
          }, window.location.origin);
          window.close();
        }
      }
    };

    handleLineCallback();
  }, [searchParams, router]);

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return '正在處理 LINE 登入...';
      case 'exchanging':
        return '正在驗證授權...';
      case 'authenticating':
        return '正在完成登入...';
      case 'success':
        return '登入成功！正在重定向...';
      case 'error':
        return '登入失敗';
      default:
        return '處理中...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="animate-spin w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          {getStatusIcon()}
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getStatusMessage()}
          </h2>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                返回登入頁面
              </button>
            </div>
          )}
          
          {status === 'loading' && (
            <p className="text-gray-600 text-sm mt-2">
              請稍候，我們正在處理您的 LINE 登入...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LineCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <svg className="animate-spin w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              正在載入...
            </h2>
          </div>
        </div>
      </div>
    }>
      <LineCallbackContent />
    </Suspense>
  );
}