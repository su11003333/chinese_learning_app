#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 執行構建後清理...');

// 要檢查的目錄
const dirsToCheck = ['dist', '.vercel/output/static'];
let targetDir = null;

// 找到實際的輸出目錄
for (const dir of dirsToCheck) {
  if (fs.existsSync(dir)) {
    targetDir = dir;
    console.log(`📁 找到輸出目錄: ${dir}`);
    break;
  }
}

if (!targetDir) {
  console.log('⚠️ 未找到輸出目錄，跳過清理');
  process.exit(0);
}

// 清理大檔案的函數
function cleanLargeFiles(directory) {
  if (!fs.existsSync(directory)) return;
  
  const items = fs.readdirSync(directory, { withFileTypes: true });
  let removedFiles = 0;
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // 遞歸處理子目錄
      removedFiles += cleanLargeFiles(fullPath);
      
      // 移除空的快取目錄
      if (item.name === 'cache' || item.name.includes('webpack')) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`🗑️ 移除快取目錄: ${fullPath}`);
          removedFiles++;
        } catch (error) {
          console.warn(`⚠️ 無法移除目錄 ${fullPath}:`, error.message);
        }
      }
    } else if (item.isFile()) {
      const stats = fs.statSync(fullPath);
      const sizeMB = stats.size / (1024 * 1024);
      
      // 移除大於 25MB 的檔案
      if (sizeMB > 25) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`🗑️ 移除大檔案: ${fullPath} (${sizeMB.toFixed(2)}MB)`);
          removedFiles++;
        } catch (error) {
          console.warn(`⚠️ 無法移除檔案 ${fullPath}:`, error.message);
        }
      }
      
      // 移除特定類型的快取檔案
      const filename = item.name;
      if (filename.endsWith('.pack') || 
          filename.includes('webpack') || 
          filename.includes('cache') ||
          filename.endsWith('.tsbuildinfo')) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`🗑️ 移除快取檔案: ${fullPath}`);
          removedFiles++;
        } catch (error) {
          console.warn(`⚠️ 無法移除快取檔案 ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  return removedFiles;
}

// 執行清理
const removedCount = cleanLargeFiles(targetDir);

// 統計結果
try {
  const stats = fs.readdirSync(targetDir, { recursive: true, withFileTypes: true });
  const fileCount = stats.filter(item => item.isFile()).length;
  
  // 檢查是否還有大檔案
  let largeFilesCount = 0;
  function checkLargeFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        checkLargeFiles(fullPath);
      } else if (item.isFile()) {
        const stats = fs.statSync(fullPath);
        const sizeMB = stats.size / (1024 * 1024);
        if (sizeMB > 25) {
          largeFilesCount++;
          console.log(`⚠️ 仍有大檔案: ${fullPath} (${sizeMB.toFixed(2)}MB)`);
        }
      }
    }
  }
  
  checkLargeFiles(targetDir);
  
  console.log('\n📊 清理結果:');
  console.log(`📁 輸出目錄: ${targetDir}`);
  console.log(`🗑️ 已移除檔案: ${removedCount}`);
  console.log(`📄 剩餘檔案: ${fileCount}`);
  console.log(`⚠️ 大檔案數量: ${largeFilesCount}`);
  
  if (largeFilesCount === 0) {
    console.log('✅ 所有檔案都符合 25MB 限制');
  } else {
    console.log('❌ 仍有檔案超過 25MB 限制');
    process.exit(1);
  }
  
} catch (error) {
  console.warn('⚠️ 統計時發生錯誤:', error.message);
}

console.log('🎉 清理完成！');