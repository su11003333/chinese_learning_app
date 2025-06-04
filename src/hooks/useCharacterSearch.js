
// ===========================================
// 更新 Hook 以支援課次
// ===========================================

// src/hooks/useCharacterSearch.js - 更新版本
import { useState, useCallback } from 'react';
import { cacheManager } from '@/utils/cacheManager';
import { publishers, publisherThemes } from '@/constants/data';

export function useCharacterSearch() {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedColor, setSelectedColor] = useState('pink');
  const [popularSearches, setPopularSearches] = useState([]);

  // 執行搜索 (更新到包含課次)
  const performSearch = useCallback(async (searchParams) => {
    const { publisher, grade, semester, lesson, characters } = searchParams;
    
    setLoading(true);
    
    try {
      const endGrade = parseInt(grade);
      const endSemester = parseInt(semester);
      const endLesson = parseInt(lesson);
      
      // 解析要查詢的字符
      const targetCharacters = characters.trim().split('').filter(char => 
        char.trim() && /[\u4e00-\u9fff]/.test(char)
      );
      
      if (targetCharacters.length === 0) {
        throw new Error('請輸入有效的中文字符');
      }

      // 記錄開始時間
      const startTime = Date.now();

      // 使用快取系統獲取結果 (包含課次)
      const results = await cacheManager.getSearchResults(
        publisher, endGrade, endSemester, endLesson, targetCharacters
      );
      
      // 計算查詢時間
      const queryTime = Date.now() - startTime;

      const searchResult = {
        publisher,
        grade: endGrade,
        semester: endSemester,
        lesson: endLesson,
        results,
        totalLearned: results.filter(r => r.isLearned).length,
        totalQueried: results.length,
        queryTime,
        fromCache: queryTime < 500
      };

      setSearchResult(searchResult);

      // 根據出版社變更顏色主題
      const theme = publisherThemes[publisher] || 'pink';
      setSelectedColor(theme);
      
      // 重新載入熱門搜索
      await loadPopularSearches();
      
      return searchResult;
      
    } catch (error) {
      console.error("查詢錯誤:", error);
      const errorResult = {
        error: true,
        message: error.message || '查詢發生錯誤，請稍後再試'
      };
      setSearchResult(errorResult);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入熱門搜索
  const loadPopularSearches = useCallback(async () => {
    try {
      const popular = await cacheManager.getPopularSearches(10);
      setPopularSearches(popular);
    } catch (error) {
      console.warn('載入熱門搜索失敗:', error);
      setPopularSearches([]);
    }
  }, []);

  // 清除搜索結果
  const clearSearchResult = useCallback(() => {
    setSearchResult(null);
  }, []);

  // 更改主題色彩
  const changeTheme = useCallback((publisher) => {
    const theme = publisherThemes[publisher] || 'pink';
    setSelectedColor(theme);
  }, []);

  return {
    // 狀態
    loading,
    searchResult,
    selectedColor,
    popularSearches,
    
    // 方法
    performSearch,
    loadPopularSearches,
    clearSearchResult,
    changeTheme
  };
}