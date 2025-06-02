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

// 聲母對照表
const initialMap = {
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  'y': '', 'w': '' // y 和 w 通常不單獨作為聲母
};

// 韻母對照表（按照長度排序，先匹配長的）
const finalMap = {
  // 三字韻母
  'iang': 'ㄧㄤ', 'iong': 'ㄩㄥ', 'uang': 'ㄨㄤ',
  
  // 雙字韻母  
  'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ', 'iou': 'ㄧㄡ',
  'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'ing': 'ㄧㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
  'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'ong': 'ㄨㄥ',
  'ue': 'ㄩㄝ', 've': 'ㄩㄝ', 'üe': 'ㄩㄝ',
  'uan': 'ㄩㄢ', 'van': 'ㄩㄢ', 'üan': 'ㄩㄢ',
  'un': 'ㄩㄣ', 'vn': 'ㄩㄣ', 'ün': 'ㄩㄣ',
  
  // 單字韻母
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ', 'v': 'ㄩ'
};

// 特殊完整拼音對照表（處理特殊情況）
const specialPinyinMap = {
  'yi': 'ㄧ', 'ya': 'ㄧㄚ', 'ye': 'ㄧㄝ', 'yao': 'ㄧㄠ', 'you': 'ㄧㄡ',
  'yan': 'ㄧㄢ', 'yin': 'ㄧㄣ', 'yang': 'ㄧㄤ', 'ying': 'ㄧㄥ', 'yong': 'ㄩㄥ',
  'wu': 'ㄨ', 'wa': 'ㄨㄚ', 'wo': 'ㄨㄛ', 'wai': 'ㄨㄞ', 'wei': 'ㄨㄟ',
  'wan': 'ㄨㄢ', 'wen': 'ㄨㄣ', 'wang': 'ㄨㄤ', 'weng': 'ㄨㄥ',
  'yu': 'ㄩ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yun': 'ㄩㄣ',
  'zi': 'ㄗ', 'ci': 'ㄘ', 'si': 'ㄙ',
  'zhi': 'ㄓ', 'chi': 'ㄔ', 'shi': 'ㄕ', 'ri': 'ㄖ'
};

// 聲調符號
const toneMap = {
  '1': '', '2': 'ˊ', '3': 'ˇ', '4': 'ˋ', '5': '˙', '0': '˙'
};

/**
 * 從拼音字符串中提取聲調
 * @param {string} pinyin - 拼音字符串
 * @returns {Object} {cleanPinyin, tone}
 */
const extractTone = (pinyin) => {
  let cleanPinyin = pinyin.toLowerCase().trim();
  let tone = '';
  
  // 檢查數字聲調
  const toneMatch = cleanPinyin.match(/[0-5]$/);
  if (toneMatch) {
    tone = toneMap[toneMatch[0]] || '';
    cleanPinyin = cleanPinyin.replace(/[0-5]$/, '');
    return { cleanPinyin, tone };
  }
  
  // 檢查聲調符號
  if (cleanPinyin.includes('ˊ')) {
    tone = 'ˊ';
    cleanPinyin = cleanPinyin.replace('ˊ', '');
  } else if (cleanPinyin.includes('ˇ')) {
    tone = 'ˇ';
    cleanPinyin = cleanPinyin.replace('ˇ', '');
  } else if (cleanPinyin.includes('ˋ')) {
    tone = 'ˋ';
    cleanPinyin = cleanPinyin.replace('ˋ', '');
  } else if (cleanPinyin.includes('˙')) {
    tone = '˙';
    cleanPinyin = cleanPinyin.replace('˙', '');
  }
  
  // 檢查拼音聲調標記
  const tonedVowels = {
    'ā': { char: 'a', tone: '' }, 'á': { char: 'a', tone: 'ˊ' }, 
    'ǎ': { char: 'a', tone: 'ˇ' }, 'à': { char: 'a', tone: 'ˋ' },
    'ē': { char: 'e', tone: '' }, 'é': { char: 'e', tone: 'ˊ' }, 
    'ě': { char: 'e', tone: 'ˇ' }, 'è': { char: 'e', tone: 'ˋ' },
    'ī': { char: 'i', tone: '' }, 'í': { char: 'i', tone: 'ˊ' }, 
    'ǐ': { char: 'i', tone: 'ˇ' }, 'ì': { char: 'i', tone: 'ˋ' },
    'ō': { char: 'o', tone: '' }, 'ó': { char: 'o', tone: 'ˊ' }, 
    'ǒ': { char: 'o', tone: 'ˇ' }, 'ò': { char: 'o', tone: 'ˋ' },
    'ū': { char: 'u', tone: '' }, 'ú': { char: 'u', tone: 'ˊ' }, 
    'ǔ': { char: 'u', tone: 'ˇ' }, 'ù': { char: 'u', tone: 'ˋ' },
    'ǖ': { char: 'ü', tone: '' }, 'ǘ': { char: 'ü', tone: 'ˊ' }, 
    'ǚ': { char: 'ü', tone: 'ˇ' }, 'ǜ': { char: 'ü', tone: 'ˋ' }
  };
  
  for (const [tonedChar, { char, tone: extractedTone }] of Object.entries(tonedVowels)) {
    if (cleanPinyin.includes(tonedChar)) {
      cleanPinyin = cleanPinyin.replace(tonedChar, char);
      tone = extractedTone;
      break;
    }
  }
  
  return { cleanPinyin, tone };
};

/**
 * 將拼音轉換為注音
 * @param {string} pinyin - 拼音字符串
 * @returns {string} 注音符號
 */
const convertPinyinToZhuyin = (pinyin) => {
  if (!pinyin) return '';
  
  const { cleanPinyin, tone } = extractTone(pinyin);
  
  // 檢查特殊完整拼音
  if (specialPinyinMap[cleanPinyin]) {
    return specialPinyinMap[cleanPinyin] + tone;
  }
  
  let result = '';
  let remaining = cleanPinyin;
  
  // 提取聲母
  let initial = '';
  // 按長度排序聲母，先匹配長的
  const sortedInitials = Object.keys(initialMap).sort((a, b) => b.length - a.length);
  
  for (const init of sortedInitials) {
    if (remaining.startsWith(init)) {
      initial = init;
      remaining = remaining.substring(init.length);
      break;
    }
  }
  
  // 添加聲母
  if (initial && initialMap[initial]) {
    result += initialMap[initial];
  }
  
  // 處理韻母
  if (remaining) {
    // 按長度排序韻母，先匹配長的
    const sortedFinals = Object.keys(finalMap).sort((a, b) => b.length - a.length);
    
    let finalFound = false;
    for (const final of sortedFinals) {
      if (remaining === final) {
        result += finalMap[final];
        finalFound = true;
        break;
      }
    }
    
    // 如果沒有找到完整匹配，嘗試分解
    if (!finalFound && remaining.length > 0) {
      console.warn(`無法匹配韻母: ${remaining} (來自拼音: ${pinyin})`);
      // 嘗試逐字符匹配
      for (const char of remaining) {
        if (finalMap[char]) {
          result += finalMap[char];
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
    // 優先檢查靜態字典
    const staticResult = getStaticPronunciation(char);
    if (staticResult) return staticResult;
    
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
    console.warn('pinyin-pro failed:', error);
  }
  
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

// 擴展的靜態字典作為備用（常用字）
const getStaticPronunciation = (char) => {
  const staticDict = {
    // 基本字詞
    '我': 'ㄨㄛˇ', '你': 'ㄋㄧˇ', '他': 'ㄊㄚ', '她': 'ㄊㄚ', '它': 'ㄊㄚ',
    '是': 'ㄕˋ', '不': 'ㄅㄨˋ', '在': 'ㄗㄞˋ', '有': 'ㄧㄡˇ', '的': 'ㄉㄜ˙',
    '和': 'ㄏㄜˊ', '了': 'ㄌㄜ˙', '到': 'ㄉㄠˋ', '會': 'ㄏㄨㄟˋ', '可': 'ㄎㄜˇ',
    
    // 學習相關
    '學': 'ㄒㄩㄝˊ', '習': 'ㄒㄧˊ', '寫': 'ㄒㄧㄝˇ', '字': 'ㄗˋ', '書': 'ㄕㄨ',
    '讀': 'ㄉㄨˊ', '說': 'ㄕㄨㄛ', '聽': 'ㄊㄧㄥ', '看': 'ㄎㄢˋ', '想': 'ㄒㄧㄤˇ',
    '知': 'ㄓ', '道': 'ㄉㄠˋ', '問': 'ㄨㄣˋ', '答': 'ㄉㄚˊ', '教': 'ㄐㄧㄠ',
    
    // 情感形容
    '愛': 'ㄞˋ', '喜': 'ㄒㄧˇ', '歡': 'ㄏㄨㄢ', '好': 'ㄏㄠˇ', '美': 'ㄇㄟˇ',
    '高': 'ㄍㄠ', '興': 'ㄒㄧㄥˋ', '快': 'ㄎㄨㄞˋ', '樂': 'ㄌㄜˋ', '開': 'ㄎㄞ',
    '心': 'ㄒㄧㄣ', '難': 'ㄋㄢˊ', '過': 'ㄍㄨㄛˋ', '怕': 'ㄆㄚˋ', '哭': 'ㄎㄨ',
    
    // 數字
    '一': 'ㄧ', '二': 'ㄦˋ', '三': 'ㄙㄢ', '四': 'ㄙˋ', '五': 'ㄨˇ',
    '六': 'ㄌㄧㄡˋ', '七': 'ㄑㄧ', '八': 'ㄅㄚ', '九': 'ㄐㄧㄡˇ', '十': 'ㄕˊ',
    '零': 'ㄌㄧㄥˊ', '百': 'ㄅㄞˇ', '千': 'ㄑㄧㄢ', '萬': 'ㄨㄢˋ',
    
    // 家庭
    '家': 'ㄐㄧㄚ', '人': 'ㄖㄣˊ', '父': 'ㄈㄨˋ', '母': 'ㄇㄨˇ', '子': 'ㄗˇ',
    '爸': 'ㄅㄚˋ', '媽': 'ㄇㄚ', '哥': 'ㄍㄜ', '姐': 'ㄐㄧㄝˇ', '弟': 'ㄉㄧˋ',
    '妹': 'ㄇㄟˋ', '爺': 'ㄧㄝˊ', '奶': 'ㄋㄞˇ', '叔': 'ㄕㄨ', '姑': 'ㄍㄨ',
    
    // 方位大小
    '大': 'ㄉㄚˋ', '小': 'ㄒㄧㄠˇ', '高': 'ㄍㄠ', '低': 'ㄉㄧ', '長': 'ㄔㄤˊ',
    '短': 'ㄉㄨㄢˇ', '上': 'ㄕㄤˋ', '下': 'ㄒㄧㄚˋ', '左': 'ㄗㄨㄛˇ', '右': 'ㄧㄡˋ',
    '前': 'ㄑㄧㄢˊ', '後': 'ㄏㄡˋ', '裡': 'ㄌㄧˇ', '外': 'ㄨㄞˋ', '邊': 'ㄅㄧㄢ',
    
    // 動作
    '來': 'ㄌㄞˊ', '去': 'ㄑㄩˋ', '走': 'ㄗㄡˇ', '跑': 'ㄆㄠˇ', '飛': 'ㄈㄟ',
    '坐': 'ㄗㄨㄛˋ', '站': 'ㄓㄢˋ', '躺': 'ㄊㄤˇ', '睡': 'ㄕㄨㄟˋ', '醒': 'ㄒㄧㄥˇ',
    '吃': 'ㄔ', '喝': 'ㄏㄜ', '玩': 'ㄨㄢˊ', '做': 'ㄗㄨㄛˋ', '買': 'ㄇㄞˇ',
    
    // 時間
    '今': 'ㄐㄧㄣ', '天': 'ㄊㄧㄢ', '昨': 'ㄗㄨㄛˊ', '明': 'ㄇㄧㄥˊ', '年': 'ㄋㄧㄢˊ',
    '月': 'ㄩㄝˋ', '日': 'ㄖˋ', '時': 'ㄕˊ', '分': 'ㄈㄣ', '秒': 'ㄇㄧㄠˇ',
    '早': 'ㄗㄠˇ', '晚': 'ㄨㄢˇ', '中': 'ㄓㄨㄥ', '午': 'ㄨˇ', '夜': 'ㄧㄝˋ',
    
    // 常用形容詞
    '新': 'ㄒㄧㄣ', '舊': 'ㄐㄧㄡˋ', '多': 'ㄉㄨㄛ', '少': 'ㄕㄠˇ', '白': 'ㄅㄞˊ',
    '黑': 'ㄏㄟ', '紅': 'ㄏㄨㄥˊ', '綠': 'ㄌㄩˋ', '藍': 'ㄌㄢˊ', '黃': 'ㄏㄨㄤˊ',
    '冷': 'ㄌㄥˇ', '熱': 'ㄖㄜˋ', '暖': 'ㄋㄨㄢˇ', '涼': 'ㄌㄧㄤˊ', '乾': 'ㄍㄢ',
    
    // 自然
    '太': 'ㄊㄞˋ', '陽': 'ㄧㄤˊ', '月': 'ㄩㄝˋ', '亮': 'ㄌㄧㄤˋ', '星': 'ㄒㄧㄥ',
    '雲': 'ㄩㄣˊ', '雨': 'ㄩˇ', '風': 'ㄈㄥ', '雪': 'ㄒㄩㄝˇ', '雷': 'ㄌㄟˊ',
    '山': 'ㄕㄢ', '水': 'ㄕㄨㄟˇ', '河': 'ㄏㄜˊ', '海': 'ㄏㄞˇ', '樹': 'ㄕㄨˋ'
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