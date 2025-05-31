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

// 拼音轉注音對照表
const pinyinToZhuyinMap = {
  // 聲母
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  
  // 韻母
  'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ', 'v': 'ㄩ',
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ',
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ',
  'er': 'ㄦ',
  
  // 複合韻母
  'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iou': 'ㄧㄡ', 'iu': 'ㄧㄡ',
  'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
  'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
  'üe': 'ㄩㄝ', 've': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'van': 'ㄩㄢ',
  'ün': 'ㄩㄣ', 'vn': 'ㄩㄣ', 'iong': 'ㄩㄥ'
};

// 聲調符號
const toneMarks = {
  '1': '', '2': 'ˊ', '3': 'ˇ', '4': 'ˋ', '5': '˙', '0': '˙'
};

/**
 * 將拼音轉換為注音
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
  
  // 移除聲調符號，提取純拼音
  cleanPinyin = cleanPinyin
    .replace(/[āáǎàa]/g, 'a')
    .replace(/[ōóǒòo]/g, 'o')
    .replace(/[ēéěèe]/g, 'e')
    .replace(/[īíǐìi]/g, 'i')
    .replace(/[ūúǔùu]/g, 'u')
    .replace(/[ǖǘǚǜü]/g, 'ü');
  
  // 檢測聲調符號
  if (!tone) {
    if (pinyin.includes('ˊ')) tone = 'ˊ';
    else if (pinyin.includes('ˇ')) tone = 'ˇ';
    else if (pinyin.includes('ˋ')) tone = 'ˋ';
    else if (pinyin.includes('˙')) tone = '˙';
    else if (pinyin.match(/[áéíóúǘ]/)) tone = 'ˊ';
    else if (pinyin.match(/[ǎěǐǒǔǚ]/)) tone = 'ˇ';
    else if (pinyin.match(/[àèìòùǜ]/)) tone = 'ˋ';
  }
  
  let result = '';
  
  // 處理特殊情況
  if (pinyinToZhuyinMap[cleanPinyin]) {
    result = pinyinToZhuyinMap[cleanPinyin];
  } else {
    // 分解聲母和韻母
    let initial = '';
    let final = cleanPinyin;
    
    // 檢測聲母
    for (const [py, zy] of Object.entries(pinyinToZhuyinMap)) {
      if (cleanPinyin.startsWith(py) && py.length > initial.length) {
        // 確保是聲母而非韻母
        if (['zh', 'ch', 'sh'].includes(py) || py.length === 1) {
          initial = py;
          final = cleanPinyin.substring(py.length);
        }
      }
    }
    
    // 轉換聲母
    if (initial && pinyinToZhuyinMap[initial]) {
      result += pinyinToZhuyinMap[initial];
    }
    
    // 轉換韻母
    if (final && pinyinToZhuyinMap[final]) {
      result += pinyinToZhuyinMap[final];
    } else if (final) {
      // 嘗試分解複合韻母
      let tempFinal = final;
      while (tempFinal.length > 0) {
        let found = false;
        for (let i = tempFinal.length; i > 0; i--) {
          const part = tempFinal.substring(0, i);
          if (pinyinToZhuyinMap[part]) {
            result += pinyinToZhuyinMap[part];
            tempFinal = tempFinal.substring(i);
            found = true;
            break;
          }
        }
        if (!found) break;
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
    
    // 停止當前播放
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 設定語音參數
    utterance.lang = options.lang || 'zh-TW';
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // 事件處理
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`語音播放錯誤: ${event.error}`));
    
    // 開始播放
    window.speechSynthesis.speak(utterance);
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

// 靜態字典作為備用（部分常用字）
const getStaticPronunciation = (char) => {
  const staticDict = {
    '我': 'ㄨㄛˇ', '你': 'ㄋㄧˇ', '他': 'ㄊㄚ', '是': 'ㄕˋ', '不': 'ㄅㄨˋ',
    '在': 'ㄗㄞˋ', '有': 'ㄧㄡˇ', '的': 'ㄉㄜ˙', '和': 'ㄏㄜˊ', '了': 'ㄌㄜ˙',
    '學': 'ㄒㄩㄝˊ', '習': 'ㄒㄧˊ', '寫': 'ㄒㄧㄝˇ', '字': 'ㄗˋ', '書': 'ㄕㄨ',
    '愛': 'ㄞˋ', '喜': 'ㄒㄧˇ', '歡': 'ㄏㄨㄢ', '好': 'ㄏㄠˇ', '美': 'ㄇㄟˇ',
    '一': 'ㄧ', '二': 'ㄦˋ', '三': 'ㄙㄢ', '四': 'ㄙˋ', '五': 'ㄨˇ',
    '六': 'ㄌㄧㄡˋ', '七': 'ㄑㄧ', '八': 'ㄅㄚ', '九': 'ㄐㄧㄡˇ', '十': 'ㄕˊ',
    '家': 'ㄐㄧㄚ', '人': 'ㄖㄣˊ', '大': 'ㄉㄚˋ', '小': 'ㄒㄧㄠˇ', '來': 'ㄌㄞˊ',
    '去': 'ㄑㄩˋ', '看': 'ㄎㄢˋ', '聽': 'ㄊㄧㄥ', '說': 'ㄕㄨㄛ', '做': 'ㄗㄨㄛˋ'
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