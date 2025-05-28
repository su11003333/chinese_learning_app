// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAa1qcb8zEekBo3FsJoENgjjC6Ut06Z0SE",
  authDomain: "kid-mcp.firebaseapp.com",
  projectId: "kid-mcp",
  storageBucket: "kid-mcp.appspot.com", 
  messagingSenderId: "636457645126",
  appId: "1:636457645126:web:25e981471bccb4ec1ac647",
  measurementId: "G-7MVBCB6MFS"
};

// 初始化 Firebase
let app;
let db;
let auth;

// 確保 Firebase 只在客戶端初始化
if (typeof window !== 'undefined') {
  // 檢查是否已經初始化
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };