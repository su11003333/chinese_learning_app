// src/utils/lineAuth.js
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// LINE Login 配置
const LINE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID,
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/line/callback` 
    : '',
  scope: 'profile openid',
  state: 'random_state_string', // 在生產環境中應該是隨機生成的
};

/**
 * 初始化 LINE Login SDK
 */
export const initLineLogin = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('LINE Login 只能在瀏覽器環境中使用'));
      return;
    }

    // 檢查是否已載入
    if (window.liff) {
      resolve(window.liff);
      return;
    }

    // 動態載入 LINE Login SDK
    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    script.onload = () => {
      if (window.liff) {
        resolve(window.liff);
      } else {
        reject(new Error('LINE SDK 載入失敗'));
      }
    };
    script.onerror = () => reject(new Error('無法載入 LINE SDK'));
    document.head.appendChild(script);
  });
};

/**
 * 使用彈出視窗進行 LINE 登入
 */
export const signInWithLinePopup = async () => {
  try {
    if (!LINE_CONFIG.clientId) {
      throw new Error('LINE Login Channel ID 未設置');
    }

    // 構建 LINE 登入 URL
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', 'code');
    lineAuthUrl.searchParams.set('client_id', LINE_CONFIG.clientId);
    lineAuthUrl.searchParams.set('redirect_uri', LINE_CONFIG.redirectUri);
    lineAuthUrl.searchParams.set('state', LINE_CONFIG.state);
    lineAuthUrl.searchParams.set('scope', LINE_CONFIG.scope);

    // 開啟彈出視窗
    const popup = window.open(
      lineAuthUrl.toString(),
      'lineLogin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      throw new Error('無法開啟登入視窗，請檢查瀏覽器的彈出視窗設置');
    }

    // 等待彈出視窗返回結果
    const result = await new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('登入視窗已關閉'));
        }
      }, 1000);

      // 監聽來自彈出視窗的消息
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'LINE_LOGIN_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve(event.data);
        } else if (event.data.type === 'LINE_LOGIN_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'LINE 登入失敗'));
        }
      };

      window.addEventListener('message', messageHandler);
    });

    // 使用獲得的 access token 進行 Firebase 登入
    return await authenticateWithFirebase(result.accessToken);

  } catch (error) {
    console.error('LINE 登入錯誤:', error);
    throw error;
  }
};

/**
 * 使用 LINE access token 與 Firebase 進行認證
 */
const authenticateWithFirebase = async (accessToken) => {
  try {
    // 調用我們的 API 來驗證 LINE token 並獲取 Firebase custom token
    const response = await fetch('/api/auth/line', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'LINE 認證失敗');
    }

    const { customToken, user } = await response.json();

    // 使用 custom token 登入 Firebase
    const userCredential = await signInWithCustomToken(auth, customToken);
    
    return {
      user: userCredential.user,
      additionalUserInfo: {
        isNewUser: false, // 這個需要從 API 返回
        profile: user,
        providerId: 'line',
      },
    };

  } catch (error) {
    console.error('Firebase 認證錯誤:', error);
    throw error;
  }
};

/**
 * 使用重定向進行 LINE 登入（移動設備推薦）
 */
export const signInWithLineRedirect = () => {
  if (!LINE_CONFIG.clientId) {
    throw new Error('LINE Login Channel ID 未設置');
  }

  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', LINE_CONFIG.clientId);
  lineAuthUrl.searchParams.set('redirect_uri', LINE_CONFIG.redirectUri);
  lineAuthUrl.searchParams.set('state', LINE_CONFIG.state);
  lineAuthUrl.searchParams.set('scope', LINE_CONFIG.scope);

  // 保存當前頁面以便登入後返回
  sessionStorage.setItem('lineLoginReturnUrl', window.location.href);
  
  // 重定向到 LINE 登入頁面
  window.location.href = lineAuthUrl.toString();
};

/**
 * 檢測是否為移動設備
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};