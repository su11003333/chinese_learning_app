// src/contexts/SpeechContext.jsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { speakText } from '@/utils/pronunciationService';

// 創建 Speech Context
const SpeechContext = createContext({});

export function SpeechProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    // 檢查語音是否已經在瀏覽器會話中啟用過
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('speechEnabled') === 'true';
    }
    return false;
  });

  // 初始化語音權限 - 必須在用戶互動事件中調用
  const initializeSpeech = useCallback(() => {
    console.log('SpeechContext: 初始化語音權限');
    
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechContext: 瀏覽器不支援語音合成');
      return false;
    }

    try {
      // 在用戶互動事件中創建一個靜默的語音測試
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0; // 靜音
      utterance.rate = 10; // 快速播放
      utterance.text = ' '; // 最小內容
      
      utterance.onstart = () => {
        console.log('SpeechContext: 語音權限已啟用');
        setSpeechEnabled(true);
        // 保存到 sessionStorage，確保在頁面切換時保持狀態
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('speechEnabled', 'true');
        }
        // 立即停止這個測試語音
        window.speechSynthesis.cancel();
      };
      
      utterance.onerror = (error) => {
        console.error('SpeechContext: 語音權限啟用失敗:', error);
        setSpeechEnabled(false);
      };
      
      // 在用戶互動的同一個事件循環中開始語音
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('SpeechContext: 初始化語音失敗:', error);
      setSpeechEnabled(false);
      return false;
    }
  }, []);

  // 播放生字資訊語音 - 主要功能
  const playCharacterInfo = useCallback(async (characterData, options = {}) => {
    const {
      character,
      zhuyin,
      radical,
      formation_words = [],
      strokeCount,
      includeZhuyin = true,
      includeStrokeCount = false,
      maxFormationWords = null,
      playerId = null, // 用於追蹤是哪個組件在播放
      lang = 'zh-TW',
      rate = 0.7,
      pitch = 1.0,
      forcePlay = false // 是否強制播放（忽略語音權限檢查）
    } = { ...characterData, ...options };

    // 如果正在播放且是同一個播放器，則忽略
    if (isPlaying && currentPlayingId === playerId) {
      return;
    }

    // 如果沒有字符，直接返回
    if (!character) {
      console.warn('SpeechContext: 沒有提供字符');
      return;
    }

    // 如果語音未啟用且不是強制播放，嘗試自動初始化一次
    if (!speechEnabled && !forcePlay) {
      console.warn('SpeechContext: 語音權限未啟用，嘗試自動初始化');
      const initialized = initializeSpeech();
      if (!initialized) {
        console.error('SpeechContext: 自動初始化失敗，無法播放語音');
        return;
      }
      // 稍微延遲再播放，等待初始化完成
      setTimeout(() => {
        playCharacterInfo(characterData, { ...options, forcePlay: true });
      }, 200);
      return;
    }

    setIsPlaying(true);
    setCurrentPlayingId(playerId);

    try {
      // 構建語音內容
      let speechText = character;
      
      // 注音
      if (includeZhuyin && zhuyin) {
        speechText += `，${zhuyin}`;
      }
      
      // 部首
      if (radical) {
        speechText += `，${radical}部`;
      }
      
      // 造詞
      if (formation_words && formation_words.length > 0) {
        const wordsToSpeak = maxFormationWords 
          ? formation_words.slice(0, maxFormationWords)
          : formation_words;
        speechText += `，${wordsToSpeak.join('，')}`;
      }
      
      // 筆畫數
      if (includeStrokeCount && strokeCount && strokeCount > 0) {
        speechText += `，${strokeCount}筆`;
      }
      
      console.log('SpeechContext: 播放語音內容:', speechText);
      
      await speakText(speechText, {
        lang,
        rate,
        pitch,
      });
      
      console.log('SpeechContext: 語音播放完成');
    } catch (error) {
      console.error('SpeechContext: 語音播放失敗:', error);
    } finally {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  }, [isPlaying, currentPlayingId]);

  // 播放基本字符發音
  const playCharacterBasic = useCallback(async (character, options = {}) => {
    const {
      playerId = null,
      lang = 'zh-TW',
      rate = 0.8,
      pitch = 1.0,
      forcePlay = false
    } = options;

    if (isPlaying && currentPlayingId === playerId) {
      return;
    }

    if (!character) {
      console.warn('SpeechContext: 沒有提供字符');
      return;
    }

    if (!speechEnabled && !forcePlay) {
      console.warn('SpeechContext: 語音權限未啟用，嘗試自動初始化');
      const initialized = initializeSpeech();
      if (!initialized) {
        console.error('SpeechContext: 自動初始化失敗，無法播放語音');
        return;
      }
      setTimeout(() => {
        playCharacterBasic(character, { ...options, forcePlay: true });
      }, 200);
      return;
    }

    setIsPlaying(true);
    setCurrentPlayingId(playerId);

    try {
      console.log('SpeechContext: 播放基本字符發音:', character);
      
      await speakText(character, {
        lang,
        rate,
        pitch,
      });
      
      console.log('SpeechContext: 基本字符發音完成');
    } catch (error) {
      console.error('SpeechContext: 基本字符發音失敗:', error);
    } finally {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  }, [isPlaying, currentPlayingId]);

  // 播放任意文本
  const playText = useCallback(async (text, options = {}) => {
    const {
      playerId = null,
      lang = 'zh-TW',
      rate = 0.8,
      pitch = 1.0,
      forcePlay = false
    } = options;

    if (isPlaying && currentPlayingId === playerId) {
      return;
    }

    if (!text) {
      console.warn('SpeechContext: 沒有提供文本');
      return;
    }

    if (!speechEnabled && !forcePlay) {
      console.warn('SpeechContext: 語音權限未啟用，嘗試自動初始化');
      const initialized = initializeSpeech();
      if (!initialized) {
        console.error('SpeechContext: 自動初始化失敗，無法播放語音');
        return;
      }
      setTimeout(() => {
        playText(text, { ...options, forcePlay: true });
      }, 200);
      return;
    }

    setIsPlaying(true);
    setCurrentPlayingId(playerId);

    try {
      console.log('SpeechContext: 播放文本:', text);
      
      await speakText(text, {
        lang,
        rate,
        pitch,
      });
      
      console.log('SpeechContext: 文本播放完成');
    } catch (error) {
      console.error('SpeechContext: 文本播放失敗:', error);
    } finally {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  }, [isPlaying, currentPlayingId]);

  // 停止當前播放
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
  }, []);

  // 立即播放語音 - 在用戶互動事件中直接調用
  const playImmediately = useCallback((characterData, options = {}) => {
    console.log('SpeechContext: 立即播放語音');
    
    // 先初始化語音權限
    const initialized = initializeSpeech();
    if (!initialized) {
      console.error('SpeechContext: 語音初始化失敗');
      return;
    }

    // 檢測是否為手機瀏覽器
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 手機瀏覽器：立即播放第一段語音
      console.log('SpeechContext: 檢測到手機瀏覽器，立即播放');
      playCharacterInfo(characterData, { ...options, forcePlay: true });
    } else {
      // 桌面瀏覽器：稍後播放
      setTimeout(() => {
        playCharacterInfo(characterData, { ...options, forcePlay: true });
      }, 100);
    }
  }, [initializeSpeech, playCharacterInfo]);

  // 檢查是否正在播放
  const isCurrentlyPlaying = useCallback((playerId = null) => {
    if (playerId) {
      return isPlaying && currentPlayingId === playerId;
    }
    return isPlaying;
  }, [isPlaying, currentPlayingId]);

  const value = {
    // 狀態
    isPlaying,
    currentPlayingId,
    speechEnabled,
    
    // 方法
    initializeSpeech,
    playCharacterInfo,
    playCharacterBasic,
    playText,
    playImmediately,
    stopSpeech,
    isCurrentlyPlaying,
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
}

// Hook 用於使用 Speech Context
export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}

export default SpeechContext;