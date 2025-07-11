// src/app/api/auth/line/token-simple/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '缺少授權碼' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID;
    const clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/line/callback-simple`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'LINE Login Channel ID 未設置' },
        { status: 500 }
      );
    }

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'LINE Login Channel Secret 未設置' },
        { status: 500 }
      );
    }

    // 交換 access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LINE token 交換失敗:', errorData);
      return NextResponse.json(
        { error: 'Token 交換失敗', details: errorData },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error('LINE token 交換處理錯誤:', error);
    return NextResponse.json(
      { error: 'Token 交換處理失敗', details: error.message },
      { status: 500 }
    );
  }
}