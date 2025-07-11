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

    // 如果 Firestore 中已有用戶記錄，使用儲存的密碼登入
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const storedPassword = userData.password || password; // 使用儲存的密碼或預設密碼
      
      console.log('用戶記錄已存在，嘗試登入:', virtualEmail);
      
      try {
        const result = await signInWithEmailAndPassword(auth, virtualEmail, storedPassword);
        firebaseUser = result.user;
        
        console.log('登入成功，用戶已存在');
        
        // 更新 Firebase Auth 用戶資料
        await updateProfile(firebaseUser, {
          displayName: lineProfile.displayName,
          photoURL: lineProfile.pictureUrl || '',
        });
        
        // 更新 Firestore 文檔
        await setDoc(userRef, {
          ...userData,
          displayName: lineProfile.displayName,
          photoURL: lineProfile.pictureUrl || '',
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
        
      } catch (signInError) {
        console.log('使用儲存密碼登入失敗，嘗試預設密碼:', signInError.code);
        
        // 如果儲存的密碼失敗，嘗試預設密碼
        if (storedPassword !== password) {
          try {
            const result = await signInWithEmailAndPassword(auth, virtualEmail, password);
            firebaseUser = result.user;
            
            // 更新密碼到 Firestore
            await setDoc(userRef, {
              ...userData,
              password: password,
              displayName: lineProfile.displayName,
              photoURL: lineProfile.pictureUrl || '',
              lastLoginAt: new Date().toISOString(),
            }, { merge: true });
            
          } catch (retryError) {
            console.error('兩種密碼都登入失敗:', retryError.code);
            throw new Error(`登入失敗，請聯繫管理員重置您的 LINE 登入設定 (錯誤: ${retryError.code})`);
          }
        } else {
          throw new Error(`登入失敗，請聯繫管理員重置您的 LINE 登入設定 (錯誤: ${signInError.code})`);
        }
      }
    } else {
      // 沒有 Firestore 記錄，嘗試用標準密碼登入可能存在的 Firebase Auth 用戶
      console.log('沒有 Firestore 記錄，嘗試登入可能存在的 Firebase Auth 用戶:', virtualEmail);
      
      try {
        const result = await signInWithEmailAndPassword(auth, virtualEmail, password);
        firebaseUser = result.user;
        
        console.log('找到現有 Firebase Auth 用戶，創建 Firestore 記錄');
        
        // 創建 Firestore 文檔
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
        console.log('沒有現有用戶，創建新用戶:', signInError.code);
        
        // 只有在確實沒有用戶時才創建新用戶
        if (signInError.code === 'auth/user-not-found' || 
            signInError.code === 'auth/invalid-credential' || 
            signInError.code === 'auth/invalid-login-credentials') {
          
          try {
            console.log('創建新 Firebase Auth 用戶');
            const result = await createUserWithEmailAndPassword(auth, virtualEmail, password);
            firebaseUser = result.user;

            // 創建 Firestore 用戶檔案
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
            
          } catch (createError) {
            console.error('創建用戶失敗:', createError);
            
            if (createError.code === 'auth/email-already-in-use') {
              // 這種情況表示 Firebase Auth 中存在用戶但密碼不對
              // 這可能是因為之前的密碼邏輯不一致造成的
              throw new Error('發現帳號衝突，請清除瀏覽器資料後重新嘗試 LINE 登入，或聯繫管理員處理');
            }
            
            throw createError;
          }
        } else {
          throw signInError;
        }
      }
    }

    // 更新 Firebase Auth 用戶資料（確保資料是最新的）
    await updateProfile(firebaseUser, {
      displayName: lineProfile.displayName,
      photoURL: lineProfile.pictureUrl || '',
    });

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