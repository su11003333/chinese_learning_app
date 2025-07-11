// src/components/auth/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { signInWithLineSimple } from '@/utils/lineAuthSimple';

// 創建一個默認值為空對象的 Context
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 監聽身份驗證狀態
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // 檢查用戶是否為管理員
        try {
          // 處理 LINE 用戶的特殊 UID 結構
          let docId = user.uid;
          if (user.email && user.email.includes('@line.local')) {
            // LINE 用戶使用不同的 document ID 格式
            const lineUserId = user.email.split('@')[0]; // 例如: "line_U1234567890"
            docId = lineUserId;
          }
          
          const userRef = doc(db, 'users', docId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          // console.error("檢查管理員權限錯誤:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // 清理訂閱
    return () => unsubscribe();
  }, []);

  // 登入函數
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 註冊函數
  const register = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 登出函數
  const logout = async () => {
    return signOut(auth);
  };

  // LINE 登入函數
  const loginWithLine = async () => {
    try {
      const result = await signInWithLineSimple();
      return result;
    } catch (error) {
      console.error('LINE 登入失敗:', error);
      throw error;
    }
  };

  // 提供值給 Context
  const value = {
    user,
    isAdmin,
    login,
    register,
    logout,
    loginWithLine,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定義 hook 用於訪問 AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};