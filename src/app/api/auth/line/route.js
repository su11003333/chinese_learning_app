// src/app/api/auth/line/route.js
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// 初始化 Firebase Admin SDK
if (!getApps().length) {
  const adminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  
  // 檢查必要的配置
  if (!adminConfig.projectId || !adminConfig.privateKey || !adminConfig.clientEmail) {
    console.warn('Firebase Admin SDK 配置不完整，LINE 登入功能將無法使用');
  } else {
    initializeApp({
      credential: cert(adminConfig),
    });
  }
}

// 檢查 Firebase Admin 是否初始化成功
let auth, db;
try {
  auth = getAuth();
  db = getFirestore();
} catch (error) {
  console.error('Firebase Admin SDK 初始化失敗:', error);
  auth = null;
  db = null;
}

export async function POST(request) {
  try {
    // 檢查 Firebase Admin SDK 是否可用
    if (!auth || !db) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK 配置不完整，請檢查環境變數' },
        { status: 500 }
      );
    }
    
    const { accessToken, idToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: '缺少 LINE access token' },
        { status: 400 }
      );
    }

    // 驗證 LINE access token
    const lineProfileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!lineProfileResponse.ok) {
      return NextResponse.json(
        { error: 'LINE token 驗證失敗' },
        { status: 401 }
      );
    }

    const lineProfile = await lineProfileResponse.json();
    
    // 構建唯一的 Firebase UID (使用 LINE user ID)
    const firebaseUID = `line_${lineProfile.userId}`;
    
    // 準備用戶資料
    const userData = {
      displayName: lineProfile.displayName,
      photoURL: lineProfile.pictureUrl || '',
      email: `${lineProfile.userId}@line.local`, // LINE 不提供 email，創建虛擬 email
      emailVerified: false,
      provider: 'line',
      lineUserId: lineProfile.userId,
    };

    try {
      // 檢查用戶是否已存在
      await auth.getUser(firebaseUID);
      
      // 更新現有用戶資料
      await auth.updateUser(firebaseUID, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 創建新用戶
        await auth.createUser({
          uid: firebaseUID,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          email: userData.email,
          emailVerified: userData.emailVerified,
        });

        // 在 Firestore 中創建用戶檔案
        await db.collection('users').doc(firebaseUID).set({
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          role: 'user',
          provider: 'line',
          lineUserId: lineProfile.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        throw error;
      }
    }

    // 生成 Firebase Custom Token
    const customToken = await auth.createCustomToken(firebaseUID, {
      provider: 'line',
      lineUserId: lineProfile.userId,
    });

    return NextResponse.json({
      success: true,
      customToken,
      user: {
        uid: firebaseUID,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        email: userData.email,
        provider: 'line',
      },
    });

  } catch (error) {
    console.error('LINE 登入處理錯誤:', error);
    return NextResponse.json(
      { error: 'LINE 登入處理失敗', details: error.message },
      { status: 500 }
    );
  }
}