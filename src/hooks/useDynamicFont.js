// src/hooks/useDynamicFont.js
import { useState, useCallback, useRef } from 'react';

/**
 * 動態字體載入 Hook
 * 提供 Google Fonts 字體子集動態載入功能
 */
export const useDynamicFont = () => {
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [loadingFonts, setLoadingFonts] = useState(new Set());
  const [fontLoadingError, setFontLoadingError] = useState(null);
  const loadingPromisesRef = useRef(new Map());

  /**
   * 載入 Google Fonts 字體子集
   * @param {string} fontFamily - 字體族名稱 (例如: 'Noto Serif TC')
   * @param {string} characters - 需要載入的字符
   * @param {string} customFamilyName - 自定義字體族名稱 (可選)
   * @returns {Promise<void>}
   */
  const loadFontSubset = useCallback(async (fontFamily, characters, customFamilyName = null) => {
    if (!fontFamily || !characters) {
      console.warn('fontFamily 和 characters 參數為必填');
      return;
    }

    const cacheKey = `${fontFamily}_${characters}`;
    const finalFamilyName = customFamilyName || fontFamily;

    // 如果已經載入過，直接返回
    if (loadedFonts.has(cacheKey)) {
      return Promise.resolve();
    }

    // 如果正在載入，返回現有的 Promise
    if (loadingPromisesRef.current.has(cacheKey)) {
      return loadingPromisesRef.current.get(cacheKey);
    }

    // 開始載入新字體
    const loadPromise = _loadFont(fontFamily, characters, cacheKey, finalFamilyName);
    loadingPromisesRef.current.set(cacheKey, loadPromise);

    // 更新載入狀態
    setLoadingFonts(prev => new Set([...prev, cacheKey]));

    return loadPromise;
  }, [loadedFonts]);

  /**
   * 內部字體載入方法
   */
  const _loadFont = async (fontFamily, characters, cacheKey, finalFamilyName) => {
    return new Promise((resolve) => {
      try {
        const textToEncode = encodeURIComponent(characters);
        const fontApiUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&text=${textToEncode}&display=swap`;

        // 檢查是否已存在相同的樣式標籤
        const existingStyle = document.querySelector(`style[data-font-cache="${cacheKey}"]`);
        if (existingStyle) {
          _onFontLoaded(cacheKey);
          resolve();
          return;
        }

        // 創建新的樣式標籤
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-font-cache', cacheKey);
        
        // 如果有自定義字體名稱，需要修改 CSS 內容
        if (finalFamilyName !== fontFamily) {
          // 先載入原始 CSS
          fetch(fontApiUrl)
            .then(response => response.text())
            .then(cssText => {
              // 替換字體族名稱
              const modifiedCss = cssText.replace(
                new RegExp(`font-family:\\s*['"]?${fontFamily}['"]?`, 'g'),
                `font-family: '${finalFamilyName}'`
              );
              styleElement.innerHTML = modifiedCss;
              document.head.appendChild(styleElement);
              _onFontLoaded(cacheKey);
              resolve();
            })
            .catch(() => {
              _onFontError(cacheKey, fontFamily);
              resolve();
            });
        } else {
          // 直接使用 @import
          styleElement.innerHTML = `@import url('${fontApiUrl}');`;
          document.head.appendChild(styleElement);
          
          // 設定載入完成的檢測
          const checkFont = () => {
            if (document.fonts && document.fonts.check) {
              try {
                if (document.fonts.check(`16px "${finalFamilyName}"`)) {
                  _onFontLoaded(cacheKey);
                  resolve();
                  return;
                }
              } catch (e) {
                // Fallback to timeout
              }
            }
            
            // Fallback: 使用簡單的超時檢測
            setTimeout(() => {
              _onFontLoaded(cacheKey);
              resolve();
            }, 2000);
          };

          // 延遲一點檢測，讓瀏覽器有時間載入
          setTimeout(checkFont, 100);
        }

        // 設定超時保護
        setTimeout(() => {
          if (loadingFonts.has(cacheKey)) {
            console.warn('字體載入超時:', fontFamily);
            _onFontError(cacheKey, fontFamily);
            resolve();
          }
        }, 10000); // 10秒超時

      } catch (error) {
        console.error('字體載入錯誤:', error);
        _onFontError(cacheKey, fontFamily);
        resolve();
      }
    });
  };

  /**
   * 字體載入成功處理
   */
  const _onFontLoaded = (cacheKey) => {
    setLoadedFonts(prev => new Set([...prev, cacheKey]));
    setLoadingFonts(prev => {
      const newSet = new Set(prev);
      newSet.delete(cacheKey);
      return newSet;
    });
    loadingPromisesRef.current.delete(cacheKey);
    console.log('字體載入成功:', cacheKey);
  };

  /**
   * 字體載入失敗處理
   */
  const _onFontError = (cacheKey, fontFamily) => {
    setLoadingFonts(prev => {
      const newSet = new Set(prev);
      newSet.delete(cacheKey);
      return newSet;
    });
    setFontLoadingError(`載入字體失敗: ${fontFamily}`);
    loadingPromisesRef.current.delete(cacheKey);
    console.warn('字體載入失敗:', fontFamily);
  };

  /**
   * 檢查字體是否已載入
   */
  const isFontLoaded = useCallback((fontFamily, characters) => {
    const cacheKey = `${fontFamily}_${characters}`;
    return loadedFonts.has(cacheKey);
  }, [loadedFonts]);

  /**
   * 檢查字體是否正在載入
   */
  const isFontLoading = useCallback((fontFamily, characters) => {
    const cacheKey = `${fontFamily}_${characters}`;
    return loadingFonts.has(cacheKey);
  }, [loadingFonts]);

  /**
   * 清除載入錯誤
   */
  const clearError = useCallback(() => {
    setFontLoadingError(null);
  }, []);

  /**
   * 獲取載入狀態統計
   */
  const getLoadingStats = useCallback(() => {
    return {
      totalLoaded: loadedFonts.size,
      currentlyLoading: loadingFonts.size,
      hasError: !!fontLoadingError
    };
  }, [loadedFonts, loadingFonts, fontLoadingError]);

  return {
    // 主要功能
    loadFontSubset,
    
    // 狀態檢查
    isFontLoaded,
    isFontLoading,
    
    // 錯誤處理
    fontLoadingError,
    clearError,
    
    // 統計信息
    getLoadingStats,
    
    // 原始狀態（如果需要）
    loadedFonts: Array.from(loadedFonts),
    loadingFonts: Array.from(loadingFonts)
  };
};

export default useDynamicFont;