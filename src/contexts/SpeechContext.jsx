// src/contexts/SpeechContext.jsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { speakText } from '@/utils/pronunciationService';

// 創建 Speech Context
const SpeechContext = createContext({});

export function SpeechProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

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
      pitch = 1.0
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
      pitch = 1.0
    } = options;

    if (isPlaying && currentPlayingId === playerId) {
      return;
    }

    if (!character) {
      console.warn('SpeechContext: 沒有提供字符');
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
      pitch = 1.0
    } = options;

    if (isPlaying && currentPlayingId === playerId) {
      return;
    }

    if (!text) {
      console.warn('SpeechContext: 沒有提供文本');
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
    
    // 方法
    playCharacterInfo,
    playCharacterBasic,
    playText,
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