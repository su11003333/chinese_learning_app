// src/lib/firebase.js - Cloudflare Pages 優化版
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Firebase 配置 - 使用環境變數
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 初始化 Firebase（避免重複初始化）
let app;
let db;
let auth;

// 確保 Firebase 只在客戶端初始化，並且只初始化一次
if (typeof window !== 'undefined') {
  try {
    // 檢查是否已經初始化
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase app');
    }
    
    // 初始化服務
    db = getFirestore(app);
    auth = getAuth(app);
    
    // 開發環境模擬器配置（如果需要）
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      // 只在開發環境且明確設定時才連接模擬器
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Failed to connect to emulators:', error);
      }
    }
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// 導出初始化的服務
export { db, auth };

// 導出配置（用於其他地方可能需要的場合）
export { firebaseConfig };

// 健康檢查函數
export const isFirebaseInitialized = () => {
  return typeof window !== 'undefined' && !!db && !!auth;
};

// 錯誤處理輔助函數
export const handleFirebaseError = (error) => {
  console.error('Firebase error:', error);
  
  const errorMessages = {
    'auth/user-not-found': '找不到此用戶',
    'auth/wrong-password': '密碼錯誤',
    'auth/too-many-requests': '請求過於頻繁，請稍後再試',
    'auth/network-request-failed': '網路連接失敗',
    'permission-denied': '權限不足',
    'unavailable': '服務暫時不可用'
  };
  
  return errorMessages[error.code] || error.message || '發生未知錯誤';
};