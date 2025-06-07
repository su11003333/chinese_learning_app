#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 開始為 Cloudflare Pages 構建...');

// 1. 清理舊的構建檔案
console.log('🧹 清理舊構建檔案...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  execSync('rm -rf out', { stdio: 'inherit' });
} catch (error) {
  console.log('清理完成（或沒有舊檔案）');
}

// 2. 執行 Next.js 構建
console.log('📦 執行 Next.js 構建...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 構建失敗:', error.message);
  process.exit(1);
}

// 3. 清理過大的快取檔案
console.log('🗑️ 清理過大的快取檔案...');
const cachePath = '.next/cache';
if (fs.existsSync(cachePath)) {
  try {
    execSync(`rm -rf ${cachePath}`, { stdio: 'inherit' });
    console.log('✅ 快取檔案已清理');
  } catch (error) {
    console.warn('⚠️ 清理快取時出現警告:', error.message);
  }
}

// 4. 檢查檔案大小
console.log('📏 檢查檔案大小...');
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

function checkDirectory(dir, maxSizeMB = 25) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const largeFiles = [];
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      largeFiles.push(...checkDirectory(fullPath, maxSizeMB));
    } else if (item.isFile()) {
      const sizeMB = getFileSizeInMB(fullPath);
      if (sizeMB > maxSizeMB) {
        largeFiles.push({
          path: fullPath,
          size: sizeMB.toFixed(2)
        });
      }
    }
  }
  
  return largeFiles;
}

if (fs.existsSync('.next')) {
  const largeFiles = checkDirectory('.next');
  
  if (largeFiles.length > 0) {
    console.log('⚠️ 發現過大檔案 (>25MB):');
    largeFiles.forEach(file => {
      console.log(`  - ${file.path}: ${file.size}MB`);
      // 刪除過大檔案
      try {
        fs.unlinkSync(file.path);
        console.log(`  ✅ 已刪除: ${file.path}`);
      } catch (error) {
        console.log(`  ❌ 無法刪除: ${file.path}`);
      }
    });
  } else {
    console.log('✅ 所有檔案大小都符合要求');
  }
}

// 5. 創建部署摘要
console.log('📋 創建部署摘要...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deployInfo = {
  timestamp: new Date().toISOString(),
  version: packageJson.version,
  buildFor: 'cloudflare-pages',
  nodeVersion: process.version
};

fs.writeFileSync('.next/deploy-info.json', JSON.stringify(deployInfo, null, 2));

console.log('🎉 Cloudflare Pages 構建完成！');
console.log('📁 輸出目錄: .next');
console.log('🚀 現在可以部署到 Cloudflare Pages');