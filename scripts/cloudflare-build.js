#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 強制使用 Cloudflare Pages 構建流程...');

// 1. 清理所有構建目錄
console.log('🧹 清理構建目錄...');
const dirsToClean = ['.next', '.vercel', 'dist', 'out'];
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
    console.log(`✅ 已清理 ${dir}`);
  }
});

// 2. 檢查並移除 Vercel 相關檔案
const vercelFiles = ['vercel.json', '.vercel'];
vercelFiles.forEach(file => {
  if (fs.existsSync(file)) {
    execSync(`rm -rf ${file}`, { stdio: 'inherit' });
    console.log(`✅ 已移除 ${file}`);
  }
});

// 3. 確保不會生成 .vercel 目錄
if (!fs.existsSync('.vercelignore')) {
  fs.writeFileSync('.vercelignore', '*\n**/*\n.*\n.*/\n');
  console.log('✅ 已創建 .vercelignore');
}

// 4. 執行 Next.js 構建（先）
console.log('📦 執行 Next.js 標準構建...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js 構建完成');
} catch (error) {
  console.error('❌ Next.js 構建失敗');
  process.exit(1);
}

// 5. 執行 Cloudflare 適配器
console.log('⚡ 執行 Cloudflare 適配器...');
try {
  execSync('npx @cloudflare/next-on-pages@1', { stdio: 'inherit' });
  console.log('✅ Cloudflare 適配器完成');
} catch (error) {
  console.error('❌ Cloudflare 適配器失敗');
  process.exit(1);
}

// 6. 再次清理 .vercel（如果生成了）
if (fs.existsSync('.vercel')) {
  execSync('rm -rf .vercel', { stdio: 'inherit' });
  console.log('✅ 已清理意外生成的 .vercel 目錄');
}

// 7. 檢查結果
if (!fs.existsSync('dist')) {
  console.error('❌ 未找到 dist 目錄');
  process.exit(1);
}

// 8. 清理大檔案
console.log('🧹 清理大檔案...');
function removelargeFiles(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      removelargeFiles(fullPath);
    } else if (item.isFile()) {
      const stats = fs.statSync(fullPath);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > 25) {
        console.log(`🗑️ 移除大檔案: ${fullPath} (${sizeMB.toFixed(2)}MB)`);
        fs.unlinkSync(fullPath);
      }
    }
  }
}

removelargeFiles('dist');

// 9. 最終報告
const distStats = execSync('du -sh dist 2>/dev/null || echo "0B"', { encoding: 'utf8' }).trim();
const fileCount = execSync('find dist -type f | wc -l', { encoding: 'utf8' }).trim();

console.log('\n🎉 構建完成！');
console.log(`📁 輸出目錄: dist (${distStats})`);
console.log(`📄 檔案數量: ${fileCount}`);
console.log('🚀 準備部署到 Cloudflare Pages');