// src/constants/data.js - 更新版本
export const publishers = ['康軒', '南一', '翰林'];
export const grades = [1, 2, 3, 4, 5, 6];
export const semesters = [1, 2];

// 出版社對應的主題色彩
export const publisherThemes = {
  '康軒': 'pink',
  '南一': 'blue', 
  '翰林': 'yellow'
};

// 主題色彩配置
export const colorThemes = {
  pink: {
    bg: 'bg-gradient-to-r from-pink-100 to-purple-100',
    card: 'bg-white',
    button: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
    input: 'focus:ring-pink-300',
    title: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
    accent: 'text-pink-600',
    border: 'border-pink-200',
  },
  blue: {
    bg: 'bg-gradient-to-r from-blue-100 to-green-100',
    card: 'bg-white',
    button: 'bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500',
    input: 'focus:ring-blue-300',
    title: 'bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent',
    accent: 'text-blue-600',
    border: 'border-blue-200',
  },
  yellow: {
    bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    card: 'bg-white',
    button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
    input: 'focus:ring-yellow-300',
    title: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent',
    accent: 'text-yellow-600',
    border: 'border-yellow-200',
  }
};

// 分頁大小選項
export const pageSizeOptions = [10, 20, 50, 100];

// 快取配置
export const cacheConfig = {
  TTL: 7 * 24 * 60 * 60 * 1000, // 7天
  VERSION: '1.0',
  BATCH_SIZE: 5,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000 // 24小時
};