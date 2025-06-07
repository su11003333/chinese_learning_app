// src/app/health/page.js
'use client';

import { useEffect, useState } from 'react';
import { isFirebaseInitialized } from '@/lib/firebase';

export default function HealthCheck() {
  const [status, setStatus] = useState({
    firebase: false,
    environment: 'unknown',
    timestamp: null,
    buildInfo: null
  });

  useEffect(() => {
    const checkHealth = () => {
      setStatus({
        firebase: isFirebaseInitialized(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        buildInfo: {
          nextVersion: process.env.NEXT_PUBLIC_VERCEL_ENV || 'local',
          nodeVersion: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        }
      });
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          系統健康檢查
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Firebase 連接:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.firebase 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.firebase ? '✅ 正常' : '❌ 異常'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">環境:</span>
              <span className="text-gray-600">{status.environment}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">檢查時間:</span>
              <span className="text-gray-600">{status.timestamp}</span>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">環境變數檢查:</h3>
              <div className="text-sm space-y-1">
                <div>
                  Firebase API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ 已設定' : '❌ 未設定'}
                </div>
                <div>
                  Firebase Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ 已設定' : '❌ 未設定'}
                </div>
                <div>
                  Firebase Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ 已設定' : '❌ 未設定'}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">功能測試:</h3>
              <div className="text-sm space-y-1">
                <div>
                  Client-side rendering: {typeof window !== 'undefined' ? '✅ 正常' : '❌ 異常'}
                </div>
                <div>
                  LocalStorage: {typeof window !== 'undefined' && window.localStorage ? '✅ 可用' : '❌ 不可用'}
                </div>
                <div>
                  Speech API: {typeof window !== 'undefined' && 'speechSynthesis' in window ? '✅ 支援' : '❌ 不支援'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            重新檢查
          </button>
        </div>
      </div>
    </div>
  );
}