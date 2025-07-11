// src/utils/lineAuthSimple.js
// 簡化版 LINE 登入，不依賴 Firebase Admin SDK

import { signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * 簡化版 LINE 登入 - 使用客戶端處理
 */
export const signInWithLineSimple = async () => {
  try {
    // 在客戶端獲取環境變數
    const channelId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || '2007736080';
    
    if (!channelId) {
      throw new Error('LINE Login Channel ID 未設置');
    }

    // 構建 LINE 登入 URL
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', 'code');
    lineAuthUrl.searchParams.set('client_id', channelId);
    lineAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/line/callback-simple`);
    lineAuthUrl.searchParams.set('state', 'simple_login_state');
    lineAuthUrl.searchParams.set('scope', 'profile openid');

    // 檢測設備類型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // 移動設備使用重定向
      sessionStorage.setItem('lineLoginReturnUrl', window.location.href);
      window.location.href = lineAuthUrl.toString();
      return null;
    } else {
      // 桌面設備使用彈出視窗
      return await handleLinePopupLogin(lineAuthUrl.toString());
    }

  } catch (error) {
    console.error('LINE 登入錯誤:', error);
    throw error;
  }
};

/**
 * 處理彈出視窗登入
 */
const handleLinePopupLogin = async (authUrl) => {
  const popup = window.open(
    authUrl,
    'lineLogin',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );

  if (!popup) {
    throw new Error('無法開啟登入視窗，請檢查瀏覽器的彈出視窗設置');
  }

  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('登入視窗已關閉'));
      }
    }, 1000);

    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'LINE_LOGIN_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(event.data.user);
      } else if (event.data.type === 'LINE_LOGIN_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error || 'LINE 登入失敗'));
      }
    };

    window.addEventListener('message', messageHandler);
  });
};

/**
 * 處理 LINE 登入回調（簡化版）
 */
export const handleLineCallbackSimple = async (code, state) => {
  try {
    if (state !== 'simple_login_state') {
      throw new Error('無效的 state 參數');
    }

    // 交換 access token（客戶端處理，僅用於展示）
    // 注意：在生產環境中，token 交換應該在伺服器端進行
    const tokenResponse = await fetch('/api/auth/line/token-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token 交換失敗');
    }

    const { accessToken } = await tokenResponse.json();

    // 獲取 LINE 用戶資料
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('獲取 LINE 用戶資料失敗');
    }

    const lineProfile = await profileResponse.json();

    // 創建或登入 Firebase 用戶
    const firebaseUser = await createOrSignInFirebaseUser(lineProfile);

    return firebaseUser;

  } catch (error) {
    console.error('LINE 回調處理錯誤:', error);
    throw error;
  }
};

/**
 * 創建或登入 Firebase 用戶
 */
const createOrSignInFirebaseUser = async (lineProfile) => {
  try {
    // 使用 LINE User ID 創建虛擬 email
    const virtualEmail = `line_${lineProfile.userId}@line.local`;
    const password = `line_${lineProfile.userId}_password`; // 使用固定密碼

    // 檢查用戶是否已存在
    const userRef = doc(db, 'users', `line_${lineProfile.userId}`);
    const userDoc = await getDoc(userRef);

    let firebaseUser;

    if (userDoc.exists()) {
      // 用戶已存在，使用現有密碼登入
      const userData = userDoc.data();
      try {
        const result = await signInWithEmailAndPassword(auth, virtualEmail, userData.password);
        firebaseUser = result.user;
        
        // 更新 Firebase Auth 用戶資料
        await updateProfile(firebaseUser, {
          displayName: lineProfile.displayName,
          photoURL: lineProfile.pictureUrl || '',
        });
        
        // 更新 Firestore 用戶資料
        await setDoc(userRef, {
          ...userData,
          displayName: lineProfile.displayName,
          photoURL: lineProfile.pictureUrl || '',
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
        
      } catch (error) {
        // 如果登入失敗，表示密碼可能不匹配
        console.log('登入失敗，可能是密碼問題:', error.message);
        throw new Error('用戶已存在但密碼不匹配，請重新嘗試 LINE 登入');
      }
    } else {
      // 嘗試先登入現有用戶，如果失敗再創建新用戶
      try {
        const result = await signInWithEmailAndPassword(auth, virtualEmail, password);
        firebaseUser = result.user;
        
        // 創建缺失的 Firestore 文檔
        await setDoc(userRef, {
          displayName: lineProfile.displayName,
          email: virtualEmail,
          photoURL: lineProfile.pictureUrl || '',
          role: 'user',
          provider: 'line',
          lineUserId: lineProfile.userId,
          password: password,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        
      } catch (signInError) {
        // 如果登入失敗，創建新用戶
        const result = await createUserWithEmailAndPassword(auth, virtualEmail, password);
        firebaseUser = result.user;

        // 創建用戶檔案
        await setDoc(userRef, {
          displayName: lineProfile.displayName,
          email: virtualEmail,
          photoURL: lineProfile.pictureUrl || '',
          role: 'user',
          provider: 'line',
          lineUserId: lineProfile.userId,
          password: password,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
      }

      // 更新 Firebase Auth 用戶資料
      await updateProfile(firebaseUser, {
        displayName: lineProfile.displayName,
        photoURL: lineProfile.pictureUrl || '',
      });
    }

    // 強制重新載入用戶資料以確保狀態同步
    await firebaseUser.reload();
    
    console.log('LINE 登入成功，Firebase 用戶已創建/更新:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    });

    return firebaseUser;

  } catch (error) {
    console.error('Firebase 用戶創建/登入錯誤:', error);
    throw error;
  }
};