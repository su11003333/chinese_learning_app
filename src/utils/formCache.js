// src/utils/formCache.js
/**
 * 表單快取管理工具
 * 用於保存和恢復用戶的表單輸入資料
 */

const CACHE_KEYS = {
    CHARACTER_SEARCH: 'character_search_form',
    SEARCH_HISTORY: 'character_search_history',
    PRACTICE_SHEET: 'character_search_form' // 統一使用同一個快取鍵
  };
  
  const CACHE_EXPIRY = Infinity; // 永久快取
  
  /**
   * 檢查快取是否過期
   */
  const isCacheExpired = (timestamp) => {
    return Date.now() - timestamp > CACHE_EXPIRY;
  };
  
  /**
   * 保存表單資料到 localStorage
   */
  export const saveFormCache = (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('保存快取失敗:', error);
    }
  };
  
  /**
   * 從 localStorage 讀取表單資料
   */
  export const loadFormCache = (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // 檢查是否過期
      if (isCacheExpired(cacheData.timestamp)) {
        localStorage.removeItem(key);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('讀取快取失敗:', error);
      return null;
    }
  };
  
  /**
   * 清除特定快取
   */
  export const clearFormCache = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('清除快取失敗:', error);
    }
  };
  
  /**
   * 保存漢字查詢表單快取
   */
  export const saveCharacterSearchCache = (formData) => {
    saveFormCache(CACHE_KEYS.CHARACTER_SEARCH, formData);
  };
  
  /**
   * 讀取漢字查詢表單快取
   */
  export const loadCharacterSearchCache = () => {
    return loadFormCache(CACHE_KEYS.CHARACTER_SEARCH);
  };
  
  /**
   * 清除漢字查詢表單快取
   */
  export const clearCharacterSearchCache = () => {
    clearFormCache(CACHE_KEYS.CHARACTER_SEARCH);
  };
  
  /**
   * 保存搜索歷史記錄
   */
  export const saveSearchHistory = (searchData) => {
    try {
      const history = loadSearchHistory() || [];
      
      // 移除重複項（基於相同的查詢條件）
      const filteredHistory = history.filter(item => 
        !(item.publisher === searchData.publisher &&
          item.grade === searchData.grade &&
          item.semester === searchData.semester &&
          item.lesson === searchData.lesson &&
          item.characters === searchData.characters)
      );
      
      // 添加新記錄到開頭
      const newHistory = [
        {
          ...searchData,
          searchTime: Date.now()
        },
        ...filteredHistory
      ].slice(0, 10); // 只保留最近10條記錄
      
      saveFormCache(CACHE_KEYS.SEARCH_HISTORY, newHistory);
    } catch (error) {
      console.warn('保存搜索歷史失敗:', error);
    }
  };
  
  /**
   * 讀取搜索歷史記錄
   */
  export const loadSearchHistory = () => {
    return loadFormCache(CACHE_KEYS.SEARCH_HISTORY) || [];
  };
  
  /**
   * 清除搜索歷史記錄
   */
  export const clearSearchHistory = () => {
    clearFormCache(CACHE_KEYS.SEARCH_HISTORY);
  };
  
  /**
   * 獲取格式化的搜索歷史
   */
  export const getFormattedSearchHistory = () => {
    const history = loadSearchHistory();
    return history.map(item => ({
      ...item,
      displayText: `${item.characters} (${item.publisher} ${item.grade}年級${item.semester}期${item.lesson}課)`,
      timeAgo: formatTimeAgo(item.searchTime)
    }));
  };
  
  /**
   * 格式化時間顯示
   */
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 7) return `${days}天前`;
    
    return new Date(timestamp).toLocaleDateString('zh-TW');
  };
  
  /**
   * 保存練習簿表單快取 (統一使用字符搜尋快取)
   */
  export const savePracticeSheetCache = (formData) => {
    saveFormCache(CACHE_KEYS.CHARACTER_SEARCH, formData);
  };
  
  /**
   * 讀取練習簿表單快取 (統一使用字符搜尋快取)
   */
  export const loadPracticeSheetCache = () => {
    return loadFormCache(CACHE_KEYS.CHARACTER_SEARCH);
  };
  
  /**
   * 清除練習簿表單快取 (統一使用字符搜尋快取)
   */
  export const clearPracticeSheetCache = () => {
    clearFormCache(CACHE_KEYS.CHARACTER_SEARCH);
  };

  export default {
    saveCharacterSearchCache,
    loadCharacterSearchCache,
    clearCharacterSearchCache,
    saveSearchHistory,
    loadSearchHistory,
    clearSearchHistory,
    getFormattedSearchHistory,
    savePracticeSheetCache,
    loadPracticeSheetCache,
    clearPracticeSheetCache
  };