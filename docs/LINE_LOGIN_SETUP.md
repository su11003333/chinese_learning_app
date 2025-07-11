# LINE 登入設置指南

## 概述

本應用已實現 LINE 登入功能，支援桌面端彈出視窗和移動端重定向兩種登入方式。用戶可以透過 LINE 帳號快速註冊和登入。

## 功能特色

- ✅ 桌面端彈出視窗登入
- ✅ 移動端重定向登入  
- ✅ 自動檢測設備類型
- ✅ 錯誤處理和重試機制
- ✅ Firebase 用戶資料同步
- ✅ 管理員角色保留

## 設置步驟

### 1. LINE Developers Console 設置

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入您的 LINE 開發者帳號
3. 建立新的 Provider（如果還沒有）
4. 在 Provider 下建立新的 Channel：
   - 選擇 "LINE Login"
   - 填寫基本資訊：
     - App name: 您的應用名稱
     - App description: 應用描述
     - App icon: 應用圖標
     - App type: Web app

### 2. LINE Login Channel 配置

在 Channel 設置頁面配置以下資訊：

#### Basic settings
- Channel ID: 記錄此 ID（用於環境變數）
- Channel secret: 記錄此 secret（用於環境變數）

#### App settings
- Callback URL: 
  ```
  https://yourdomain.com/auth/line/callback-simple
  http://localhost:3000/auth/line/callback-simple (開發環境)
  ```

#### OpenID Connect settings
- Scope: 勾選 `profile` 和 `openid`

### 3. 環境變數設置

在您的 `.env.local` 檔案中新增：

```env
# LINE Login 設置
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=您的Channel_ID
LINE_LOGIN_CHANNEL_SECRET=您的Channel_Secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**重要提醒：**
- `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` 是公開變數，會在客戶端使用
- `LINE_LOGIN_CHANNEL_SECRET` 是私密變數，僅在伺服器端使用
- 在生產環境請確保設置正確的 `NEXT_PUBLIC_APP_URL`

### 4. 部署設置

#### Cloudflare Pages 環境變數
在 Cloudflare Pages 控制台設置環境變數：

1. 前往您的專案設置
2. 點擊 "Environment variables"
3. 新增以下變數：
   - `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`: 您的 Channel ID
   - `LINE_LOGIN_CHANNEL_SECRET`: 您的 Channel Secret  
   - `NEXT_PUBLIC_APP_URL`: 您的網域名稱

## 使用方式

### 登入頁面
用戶可以在登入頁面點擊 "使用 LINE 帳號登入" 按鈕：
- 桌面設備：開啟彈出視窗進行登入
- 移動設備：重定向到 LINE 登入頁面

### 註冊頁面
同樣提供 LINE 登入選項，自動建立新用戶帳號。

## 技術架構

### 簡化版實現
本應用使用簡化版 LINE 登入實現：
- 不依賴 Firebase Admin SDK
- 使用虛擬 email 和密碼創建 Firebase 用戶
- 支援跨平台設備檢測

### 資料流程
1. 用戶點擊 LINE 登入
2. 重定向到 LINE 授權頁面
3. 用戶授權後返回回調頁面
4. 交換 access token
5. 獲取 LINE 用戶資料
6. 創建或登入 Firebase 用戶
7. 重定向到原始頁面

### 檔案結構
```
src/
├── utils/lineAuthSimple.js          # LINE 登入核心邏輯
├── app/api/auth/line/token-simple/  # Token 交換 API
├── app/auth/line/callback-simple/   # 登入回調頁面
└── components/auth/AuthContext.jsx  # 整合認證上下文
```

## 安全考量

### State 參數
使用 state 參數防止 CSRF 攻擊：
```javascript
state: 'simple_login_state'
```

### 虛擬 Email
為 LINE 用戶生成唯一虛擬 email：
```javascript
const virtualEmail = `line_${lineProfile.userId}@line.local`;
```

### 密碼存儲
雖然存儲加密密碼，但建議：
- 定期更新密碼
- 監控異常登入行為
- 考慮實作密碼哈希

## 故障排除

### 常見錯誤

1. **Token 交換失敗**
   - 檢查 Channel Secret 是否正確
   - 確認 Callback URL 設置正確

2. **無法開啟登入視窗**  
   - 檢查瀏覽器彈出視窗設置
   - 確認沒有被廣告攔截器阻擋

3. **環境變數未設置**
   - 確認 `.env.local` 檔案存在
   - 重啟開發伺服器

### 除錯方式

1. 檢查瀏覽器開發者工具的網路和控制台標籤
2. 查看伺服器端日誌
3. 確認 LINE Developers Console 的設置

## 功能限制

### 目前實現
- ✅ 基本登入/註冊功能
- ✅ 用戶資料同步
- ✅ 跨設備支援

### 未來增強
- 🔄 支援 LINE Notify
- 🔄 實作 refresh token
- 🔄 更強的安全驗證

## 測試

### 開發環境測試
1. 啟動開發伺服器：`npm run dev`
2. 前往 `http://localhost:3000/login`
3. 點擊 LINE 登入按鈕測試

### 生產環境測試
1. 確認環境變數設置正確
2. 測試不同設備和瀏覽器
3. 檢查用戶資料是否正確儲存

---

**注意：** 請妥善保管您的 Channel Secret，切勿在公開代碼庫中暴露。