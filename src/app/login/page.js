// src/app/auth/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';

export default function Login() {
  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const router = useRouter();
  const { loginWithLine } = useAuth();

  // 檢查用戶是否已登入，若已登入則重定向到首頁
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);


  // 使用 Google 登入
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // 檢查用戶是否存在於資料庫中
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // 若用戶不存在，建立新用戶檔案
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName || '',
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL || '',
          provider: 'google'
        });
      }
      
      router.push('/');
    } catch (error) {
      console.error('Google 登入失敗:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('登入視窗已關閉，請重試');
      } else {
        setError('使用 Google 登入失敗，請稍後再試');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // 使用 LINE 登入
  const handleLineSignIn = async () => {
    setLineLoading(true);
    setError(null);
    
    try {
      const result = await loginWithLine();
      // 如果是重定向登入（移動設備），result 可能為 null
      if (result) {
        router.push('/');
      }
      // 如果是重定向登入，當前頁面會自動跳轉，不需處理
    } catch (error) {
      console.error('LINE 登入失敗:', error);
      
      if (error.message.includes('登入視窗已關閉')) {
        setError('登入視窗已關閉，請重試');
      } else if (error.message.includes('彈出視窗')) {
        setError('無法開啟登入視窗，請檢查瀏覽器設置');
      } else {
        setError('使用 LINE 登入失敗，請稍後再試');
      }
    } finally {
      setLineLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">歡迎回來</h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            選擇您偏好的登入方式，繼續學習之旅
          </p>
          
          {/* Google 登入按鈕 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || lineLoading}
            className="w-full mb-4 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition disabled:opacity-50"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
            )}
            使用 Google 帳號登入
          </button>
          
          {/* LINE 登入按鈕 */}
          <button
            onClick={handleLineSignIn}
            disabled={lineLoading || googleLoading}
            className="w-full mb-6 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-full text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition disabled:opacity-50"
          >
            {lineLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            )}
            使用 LINE 帳號登入
          </button>
          
          {error && (
           <div className="rounded-xl bg-red-50 p-3 mb-4">
             <p className="text-sm text-red-500 text-center">{error}</p>
           </div>
         )}
         
         <div className="mt-6 text-center">
           <p className="text-sm text-gray-600">
             還沒有帳號？{' '}
             <Link href="/register" className="font-medium text-blue-400 hover:text-blue-500">
               立即註冊
             </Link>
           </p>
         </div>
       </div>
     </div>
   </div>
 );
}