// src/utils/pronunciationService.js

/**
 * 注音和拼音服務
 * 支持多個套件的整合使用
 */

// 動態載入 pinyin-pro 套件（瀏覽器環境）
let pinyinPro = null;
let isLoading = false;
let loadPromise = null;

const loadPinyinPro = async () => {
  if (pinyinPro) return pinyinPro;
  if (isLoading) return loadPromise;
  
  isLoading = true;
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // 嘗試從 CDN 載入 pinyin-pro
      if (typeof window !== 'undefined') {
        // 檢查是否已經載入
        if (window.pinyinPro) {
          pinyinPro = window.pinyinPro;
          resolve(pinyinPro);
          return;
        }

        // 動態載入 CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js';
        script.onload = () => {
          if (window.pinyinPro) {
            pinyinPro = window.pinyinPro;
            resolve(pinyinPro);
          } else {
            reject(new Error('pinyin-pro failed to load'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load pinyin-pro'));
        document.head.appendChild(script);
      } else {
        // Node.js 環境 (如果需要)
        try {
          pinyinPro = await import('pinyin-pro');
          resolve(pinyinPro);
        } catch (error) {
          reject(error);
        }
      }
    } catch (error) {
      reject(error);
    } finally {
      isLoading = false;
    }
  });
  
  return loadPromise;
};

// 拼音轉注音對照表 - 重新整理並修正
const pinyinToZhuyinMap = {
  // === 聲母 ===
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  
  // === 韻母 ===
  // 單韻母
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ',
  'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ', 'v': 'ㄩ',
  'er': 'ㄦ',
  
  // 複韻母
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  
  // 鼻韻母
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ',
  
  // === 結合韻母（ㄧ行） ===
  'ya': 'ㄧㄚ', 'ia': 'ㄧㄚ',
  'yo': 'ㄧㄛ', 'io': 'ㄧㄛ',
  'ye': 'ㄧㄝ', 'ie': 'ㄧㄝ',
  'yai': 'ㄧㄞ', 'iai': 'ㄧㄞ',
  'yao': 'ㄧㄠ', 'iao': 'ㄧㄠ',
  'you': 'ㄧㄡ', 'iou': 'ㄧㄡ', 'iu': 'ㄧㄡ',
  'yan': 'ㄧㄢ', 'ian': 'ㄧㄢ',
  'yin': 'ㄧㄣ', 'in': 'ㄧㄣ',
  'yang': 'ㄧㄤ', 'iang': 'ㄧㄤ',
  'ying': 'ㄧㄥ', 'ing': 'ㄧㄥ',
  
  // === 結合韻母（ㄨ行） ===
  'wa': 'ㄨㄚ', 'ua': 'ㄨㄚ',
  'wo': 'ㄨㄛ', 'uo': 'ㄨㄛ',
  'wai': 'ㄨㄞ', 'uai': 'ㄨㄞ',
  'wei': 'ㄨㄟ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
  'wan': 'ㄨㄢ', 'uan': 'ㄨㄢ',
  'wen': 'ㄨㄣ', 'un': 'ㄨㄣ',
  'wang': 'ㄨㄤ', 'uang': 'ㄨㄤ',
  'weng': 'ㄨㄥ', 'ong': 'ㄨㄥ',
  
  // === 結合韻母（ㄩ行） ===
  'yu': 'ㄩ',
  'yue': 'ㄩㄝ', 'üe': 'ㄩㄝ', 've': 'ㄩㄝ',
  'yuan': 'ㄩㄢ', 'üan': 'ㄩㄢ', 'van': 'ㄩㄢ',
  'yun': 'ㄩㄣ', 'ün': 'ㄩㄣ', 'vn': 'ㄩㄣ',
  'yong': 'ㄩㄥ', 'iong': 'ㄩㄥ',
  
  // === 特殊組合 ===
  // 空韻（只有聲母的情況）
  'zhi': 'ㄓ', 'chi': 'ㄔ', 'shi': 'ㄕ', 'ri': 'ㄖ',
  'zi': 'ㄗ', 'ci': 'ㄘ', 'si': 'ㄙ',
  
  // === 完整音節映射（常見字） ===
  // a行
  'a': 'ㄚ',
  'ai': 'ㄞ',
  'an': 'ㄢ',
  'ang': 'ㄤ',
  'ao': 'ㄠ',
  
  // o行
  'o': 'ㄛ',
  'ou': 'ㄡ',
  
  // e行
  'e': 'ㄜ',
  'ei': 'ㄟ',
  'en': 'ㄣ',
  'eng': 'ㄥ',
  'er': 'ㄦ'
};

// 聲調符號
const toneMarks = {
  '1': '', '2': 'ˊ', '3': 'ˇ', '4': 'ˋ', '5': '˙', '0': '˙'
};

/**
 * 將拼音轉換為注音 - 改進版算法
 * @param {string} pinyin - 拼音字符串
 * @returns {string} 注音符號
 */
const convertPinyinToZhuyin = (pinyin) => {
  if (!pinyin) return '';
  
  // 移除空格和特殊字符，轉為小寫
  let cleanPinyin = pinyin.toLowerCase().trim();
  
  // 提取聲調
  let tone = '';
  const toneMatch = cleanPinyin.match(/[1-5]$/);
  if (toneMatch) {
    tone = toneMarks[toneMatch[0]] || '';
    cleanPinyin = cleanPinyin.replace(/[1-5]$/, '');
  }
  
  // 移除聲調符號，提取純拼音，並檢測聲調
  const originalPinyin = cleanPinyin;
  cleanPinyin = cleanPinyin
    .replace(/[āáǎàa]/g, 'a')
    .replace(/[ōóǒòo]/g, 'o')
    .replace(/[ēéěèe]/g, 'e')
    .replace(/[īíǐìi]/g, 'i')
    .replace(/[ūúǔùu]/g, 'u')
    .replace(/[ǖǘǚǜü]/g, 'ü');
  
  // 檢測聲調符號（如果還沒有的話）
  if (!tone) {
    if (originalPinyin.match(/[áéíóúǘ]/)) tone = 'ˊ';
    else if (originalPinyin.match(/[ǎěǐǒǔǚ]/)) tone = 'ˇ';
    else if (originalPinyin.match(/[àèìòùǜ]/)) tone = 'ˋ';
    else if (originalPinyin.includes('ˊ')) tone = 'ˊ';
    else if (originalPinyin.includes('ˇ')) tone = 'ˇ';
    else if (originalPinyin.includes('ˋ')) tone = 'ˋ';
    else if (originalPinyin.includes('˙')) tone = '˙';
  }
  
  // 直接查找完整拼音
  if (pinyinToZhuyinMap[cleanPinyin]) {
    return pinyinToZhuyinMap[cleanPinyin] + tone;
  }
  
  let result = '';
  let remaining = cleanPinyin;
  
  // 特殊處理：zh, ch, sh, z, c, s + i 的情況
  if (['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si'].includes(cleanPinyin)) {
    return pinyinToZhuyinMap[cleanPinyin] + tone;
  }
  
  // 先嘗試匹配聲母
  let initialFound = '';
  for (const initial of ['zh', 'ch', 'sh', 'ng']) {
    if (remaining.startsWith(initial)) {
      if (pinyinToZhuyinMap[initial]) {
        result += pinyinToZhuyinMap[initial];
        remaining = remaining.substring(initial.length);
        initialFound = initial;
        break;
      }
    }
  }
  
  // 如果沒找到雙字母聲母，嘗試單字母聲母
  if (!initialFound) {
    for (const initial of ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's']) {
      if (remaining.startsWith(initial)) {
        if (pinyinToZhuyinMap[initial]) {
          result += pinyinToZhuyinMap[initial];
          remaining = remaining.substring(initial.length);
          initialFound = initial;
          break;
        }
      }
    }
  }
  
  // 處理韻母部分
  if (remaining) {
    // 首先嘗試直接匹配韻母
    if (pinyinToZhuyinMap[remaining]) {
      result += pinyinToZhuyinMap[remaining];
    } else {
      // 嘗試從長到短匹配韻母
      let matched = false;
      for (let i = remaining.length; i > 0; i--) {
        const part = remaining.substring(0, i);
        if (pinyinToZhuyinMap[part]) {
          result += pinyinToZhuyinMap[part];
          remaining = remaining.substring(i);
          matched = true;
          break;
        }
      }
      
      // 如果還有剩餘，繼續處理
      if (remaining && !matched) {
        // 逐字符處理剩餘部分
        for (let i = 0; i < remaining.length; i++) {
          const char = remaining[i];
          if (pinyinToZhuyinMap[char]) {
            result += pinyinToZhuyinMap[char];
          }
        }
      }
    }
  }
  
  return result + tone;
};

/**
 * 獲取單個漢字的注音
 * @param {string} char - 單個漢字
 * @returns {Promise<string>} 注音符號
 */
export const getCharacterZhuyin = async (char) => {
  try {
    // 嘗試使用 pinyin-pro
    const pinyinProLib = await loadPinyinPro();
    if (pinyinProLib && pinyinProLib.pinyin) {
      const pinyinResult = pinyinProLib.pinyin(char, { toneType: 'num' });
      if (pinyinResult) {
        const zhuyin = convertPinyinToZhuyin(pinyinResult);
        if (zhuyin) return zhuyin;
      }
    }
  } catch (error) {
    console.warn('pinyin-pro failed, falling back to static data:', error);
  }
  
  // 備用靜態字典
  const staticDict = getStaticPronunciation(char);
  if (staticDict) return staticDict;
  
  return ''; // 未找到
};

/**
 * 批量獲取多個漢字的注音
 * @param {string[]} characters - 漢字數組
 * @returns {Promise<Object>} 字符-注音對照物件
 */
export const getBatchZhuyin = async (characters) => {
  const results = {};
  
  for (const char of characters) {
    try {
      results[char] = await getCharacterZhuyin(char);
    } catch (error) {
      console.warn(`獲取 ${char} 注音失敗:`, error);
      results[char] = '';
    }
  }
  
  return results;
};

/**
 * 語音朗讀功能
 * @param {string} text - 要朗讀的文字
 * @param {Object} options - 朗讀選項
 */
export const speakText = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('瀏覽器不支援語音功能'));
      return;
    }
    
    // 只有當前正在播放時才取消，避免不必要的取消
    if (window.speechSynthesis.speaking) {
      console.log('正在播放語音，取消當前播放');
      window.speechSynthesis.cancel();
      // 等待一小段時間確保取消完成
      setTimeout(() => {
        startSpeaking();
      }, 100);
    } else {
      startSpeaking();
    }
    
    function startSpeaking() {
      // 檢查語音引擎狀態
      console.log('speechSynthesis.speaking:', window.speechSynthesis.speaking);
      console.log('speechSynthesis.pending:', window.speechSynthesis.pending);
      console.log('speechSynthesis.paused:', window.speechSynthesis.paused);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 設定語音參數
      utterance.lang = options.lang || 'zh-TW';
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      
      // 事件處理
      utterance.onend = () => {
        console.log('語音播放完成:', text);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error('語音播放錯誤:', event.error, 'for text:', text);
        reject(new Error(`語音播放錯誤: ${event.error}`));
      };
      utterance.onstart = () => {
        console.log('語音開始播放:', text);
      };
      
      // 確保語音引擎準備就緒
      if (window.speechSynthesis.paused) {
        console.log('語音引擎暫停，恢復播放');
        window.speechSynthesis.resume();
      }
      
      // 開始播放
      console.log('調用 speechSynthesis.speak for:', text);
      window.speechSynthesis.speak(utterance);
      
      // 檢查是否實際開始播放
      setTimeout(() => {
        console.log('播放後狀態檢查:');
        console.log('speechSynthesis.speaking:', window.speechSynthesis.speaking);
        console.log('speechSynthesis.pending:', window.speechSynthesis.pending);
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          console.warn('語音可能沒有開始播放，嘗試重新播放');
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  });
};

/**
 * 獲取可用的語音列表
 * @returns {Promise<Array>} 語音列表
 */
export const getAvailableVoices = () => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // 過濾中文語音
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      resolve(chineseVoices.length > 0 ? chineseVoices : voices);
    } else {
      // 有些瀏覽器需要等待語音載入
      window.speechSynthesis.onvoiceschanged = () => {
        const newVoices = window.speechSynthesis.getVoices();
        const chineseVoices = newVoices.filter(voice => 
          voice.lang.includes('zh') || voice.lang.includes('cmn')
        );
        resolve(chineseVoices.length > 0 ? chineseVoices : newVoices);
      };
    }
  });
};

// 靜態字典作為備用（擴充常用字，包含正確注音）
const getStaticPronunciation = (char) => {
  const staticDict = {
    // 基本字詞
    '我': 'ㄨㄛˇ', '你': 'ㄋㄧˇ', '他': 'ㄊㄚ', '她': 'ㄊㄚ', '它': 'ㄊㄚ',
    '是': 'ㄕˋ', '不': 'ㄅㄨˋ', '在': 'ㄗㄞˋ', '有': 'ㄧㄡˇ', '的': 'ㄉㄜ˙',
    '和': 'ㄏㄜˊ', '了': 'ㄌㄜ˙', '也': 'ㄧㄝˇ', '會': 'ㄏㄨㄟˋ', '要': 'ㄧㄠˋ',
    
    // 學習相關
    '學': 'ㄒㄩㄝˊ', '習': 'ㄒㄧˊ', '寫': 'ㄒㄧㄝˇ', '字': 'ㄗˋ', '書': 'ㄕㄨ',
    '讀': 'ㄉㄨˊ', '念': 'ㄋㄧㄢˋ', '課': 'ㄎㄜˋ', '本': 'ㄅㄣˇ', '筆': 'ㄅㄧˇ',
    
    // 情感詞彙
    '愛': 'ㄞˋ', '喜': 'ㄒㄧˇ', '歡': 'ㄏㄨㄢ', '好': 'ㄏㄠˇ', '美': 'ㄇㄟˇ',
    '快': 'ㄎㄨㄞˋ', '樂': 'ㄌㄜˋ', '開': 'ㄎㄞ', '心': 'ㄒㄧㄣ', '高': 'ㄍㄠ',
    
    // 數字
    '一': 'ㄧ', '二': 'ㄦˋ', '三': 'ㄙㄢ', '四': 'ㄙˋ', '五': 'ㄨˇ',
    '六': 'ㄌㄧㄡˋ', '七': 'ㄑㄧ', '八': 'ㄅㄚ', '九': 'ㄐㄧㄡˇ', '十': 'ㄕˊ',
    '零': 'ㄌㄧㄥˊ', '百': 'ㄅㄞˇ', '千': 'ㄑㄧㄢ', '萬': 'ㄨㄢˋ',
    
    // 家庭
    '家': 'ㄐㄧㄚ', '人': 'ㄖㄣˊ', '爸': 'ㄅㄚˋ', '媽': 'ㄇㄚ', '爺': 'ㄧㄝˊ',
    '奶': 'ㄋㄞˇ', '哥': 'ㄍㄜ', '姐': 'ㄐㄧㄝˇ', '弟': 'ㄉㄧˋ', '妹': 'ㄇㄟˋ',
    
    // 方位大小
    '大': 'ㄉㄚˋ', '小': 'ㄒㄧㄠˇ', '長': 'ㄔㄤˊ', '短': 'ㄉㄨㄢˇ', '高': 'ㄍㄠ',
    '矮': 'ㄞˇ', '胖': 'ㄆㄤˋ', '瘦': 'ㄕㄡˋ', '上': 'ㄕㄤˋ', '下': 'ㄒㄧㄚˋ',
    '前': 'ㄑㄧㄢˊ', '後': 'ㄏㄡˋ', '左': 'ㄗㄨㄛˇ', '右': 'ㄧㄡˋ', '中': 'ㄓㄨㄥ',
    
    // 動作
    '來': 'ㄌㄞˊ', '去': 'ㄑㄩˋ', '看': 'ㄎㄢˋ', '聽': 'ㄊㄧㄥ', '說': 'ㄕㄨㄛ',
    '做': 'ㄗㄨㄛˋ', '吃': 'ㄔ', '喝': 'ㄏㄜ', '睡': 'ㄕㄨㄟˋ', '起': 'ㄑㄧˇ',
    '坐': 'ㄗㄨㄛˋ', '站': 'ㄓㄢˋ', '走': 'ㄗㄡˇ', '跑': 'ㄆㄠˇ', '跳': 'ㄊㄧㄠˋ',
    
    // 常見字（修正版）
    '順': 'ㄕㄨㄣˋ', // 修正：不是ㄕㄩㄣˋ
    '準': 'ㄓㄨㄣˇ',
    '春': 'ㄔㄨㄣ',
    '純': 'ㄔㄨㄣˊ',
    '詢': 'ㄒㄩㄣˊ',
    '迅': 'ㄒㄩㄣˋ',
    '訊': 'ㄒㄩㄣˋ',
    '恂': 'ㄒㄩㄣˊ',
    
    // 時間
    '年': 'ㄋㄧㄢˊ', '月': 'ㄩㄝˋ', '日': 'ㄖˋ', '天': 'ㄊㄧㄢ', '時': 'ㄕˊ',
    '分': 'ㄈㄣ', '秒': 'ㄇㄧㄠˇ', '早': 'ㄗㄠˇ', '晚': 'ㄨㄢˇ', '今': 'ㄐㄧㄣ',
    '昨': 'ㄗㄨㄛˊ', '明': 'ㄇㄧㄥˊ', '現': 'ㄒㄧㄢˋ', '過': 'ㄍㄨㄛˋ', '將': 'ㄐㄧㄤ',
    
    // 顏色
    '紅': 'ㄏㄨㄥˊ', '橙': 'ㄔㄥˊ', '黃': 'ㄏㄨㄤˊ', '綠': 'ㄌㄩˋ', '藍': 'ㄌㄢˊ',
    '紫': 'ㄗˇ', '黑': 'ㄏㄟ', '白': 'ㄅㄞˊ', '灰': 'ㄏㄨㄟ', '粉': 'ㄈㄣˇ'
  };
  
  return staticDict[char] || '';
};


export default {
  getCharacterZhuyin,
  getBatchZhuyin,
  speakText,
  getAvailableVoices,
  convertPinyinToZhuyin
};