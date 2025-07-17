// src/components/ui/CharacterDisplay.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSpeech } from '@/contexts/SpeechContext';

/**
 * 漢字注音顯示組件
 * 支持橫向和直立兩種注音顯示方式
 */
export default function CharacterDisplay({ 
  character, 
  zhuyin, 
  radical, // 新增部首
  formation_words = [], // 新增造詞陣列
  layout = 'horizontal', // 'horizontal' | 'vertical'
  size = 'medium', // 'small' | 'medium' | 'large'
  showPronunciation = true,
  showCharacter = true, // 控制是否顯示漢字
  showSpeaker = true,
  showDetails = true, // 控制是否顯示部首和造詞
  className = '',
  onClick,
  theme = 'default' // 'default' | 'green' | 'blue' | 'purple'
}) {
  const { playCharacterInfo, isCurrentlyPlaying } = useSpeech();
  const playerId = `character-display-${character}`;

  // 尺寸配置
  const sizeConfig = {
    small: {
      character: 'text-3xl',
      zhuyin: 'text-sm',
      container: 'p-3',
      spacing: layout === 'vertical' ? 'gap-1' : 'gap-2'
    },
    medium: {
      character: 'text-5xl',
      zhuyin: 'text-base',
      container: 'p-4',
      spacing: layout === 'vertical' ? 'gap-2' : 'gap-3'
    },
    large: {
      character: 'text-7xl',
      zhuyin: 'text-lg',
      container: 'p-6',
      spacing: layout === 'vertical' ? 'gap-3' : 'gap-4'
    }
  };

  // 主題配置
  const themeConfig = {
    default: {
      bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
      border: 'border-gray-300',
      character: 'text-gray-800',
      zhuyin: 'text-blue-600',
      speaker: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-blue-50',
      border: 'border-green-300',
      character: 'text-gray-800',
      zhuyin: 'text-green-600',
      speaker: 'text-green-500 hover:text-green-700 hover:bg-green-100'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-purple-50',
      border: 'border-blue-300',
      character: 'text-gray-800',
      zhuyin: 'text-blue-600',
      speaker: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-300',
      character: 'text-gray-800',
      zhuyin: 'text-purple-600',
      speaker: 'text-purple-500 hover:text-purple-700 hover:bg-purple-100'
    }
  };

  const currentSize = sizeConfig[size];
  const currentTheme = themeConfig[theme];

  // 語音播放 - 使用 SpeechContext
  const handleSpeak = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isCurrentlyPlaying(playerId) || !character) return;
    
    await playCharacterInfo({
      character,
      zhuyin,
      radical,
      formation_words,
      includeZhuyin: true,
      includeStrokeCount: false,
      playerId,
      rate: 0.7,
      pitch: 1.0,
    });
  };

  // 點擊處理
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // 解析注音字符和聲調
  const parseZhuyin = (zhuyinStr) => {
    if (!zhuyinStr) return { mainChars: '', tone: '' };
    
    const toneMarks = ['ˊ', 'ˇ', 'ˋ', '˙'];
    let mainChars = '';
    let tone = '';
    
    for (let i = 0; i < zhuyinStr.length; i++) {
      const char = zhuyinStr[i];
      if (toneMarks.includes(char)) {
        tone = char;
      } else {
        mainChars += char;
      }
    }
    
    return { mainChars, tone };
  };

  // 直立注音組件 - 改進版本，正確處理聲調位置
  const VerticalZhuyin = ({ zhuyin }) => {
    if (!zhuyin) return null;
    
    const { mainChars, tone } = parseZhuyin(zhuyin);
    
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[60px]">
        {/* 輕聲在上方 */}
        {tone === '˙' && (
          <span
            className={`${currentSize.zhuyin} ${currentTheme.zhuyin} font-medium leading-none absolute`}
            style={{ 
              top: '-0.5em',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {tone}
          </span>
        )}
        
        {/* 主要注音字符 */}
        <div className="flex flex-col items-center">
          {mainChars.split('').map((char, index) => (
            <span
              key={index}
              className={`${currentSize.zhuyin} ${currentTheme.zhuyin} font-medium leading-tight`}
              style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            >
              {char}
            </span>
          ))}
        </div>
        
        {/* 二三四聲在右側 */}
        {tone && tone !== '˙' && (
          <span
            className={`${currentSize.zhuyin} ${currentTheme.zhuyin} font-medium leading-none absolute`}
            style={{ 
              right: '-0.6em',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {tone}
          </span>
        )}
      </div>
    );
  };

  // 橫向注音組件
  const HorizontalZhuyin = ({ zhuyin }) => {
    if (!zhuyin) return null;
    
    return (
      <span className={`${currentSize.zhuyin} ${currentTheme.zhuyin} font-medium text-center`}>
        {zhuyin}
      </span>
    );
  };

  return (
    <div
      className={`
        relative rounded-2xl border-2 ${currentTheme.border} ${currentTheme.bg} 
        ${currentSize.container} ${className}
        ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:scale-105' : ''}
        transition-all duration-200
      `}
      onClick={handleClick}
    >
      {/* 主要內容區域 */}
      <div className={`
        flex items-center justify-center 
        ${layout === 'vertical' ? 'flex-col' : 'flex-row'} 
        ${currentSize.spacing}
      `}>
        {/* 漢字 */}
        {showCharacter && character && (
          <div className="flex items-center justify-center">
            <span className={`${currentSize.character} ${currentTheme.character} font-bold`}>
              {character}
            </span>
          </div>
        )}

        {/* 注音 */}
        {showPronunciation && zhuyin && (
          <div className="flex items-center justify-center">
            {layout === 'vertical' ? (
              <VerticalZhuyin zhuyin={zhuyin} />
            ) : (
              <HorizontalZhuyin zhuyin={zhuyin} />
            )}
          </div>
        )}
      </div>

      {/* 詳細資訊 - 部首和造詞 */}
      {showDetails && (radical || (formation_words && formation_words.length > 0)) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* 部首 */}
          {radical && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 font-medium">部首：</span>
              <span className={`text-sm ${currentTheme.zhuyin} font-medium ml-1`}>
                {radical}
              </span>
            </div>
          )}
          
          {/* 造詞 */}
          {formation_words && formation_words.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 font-medium">造詞：</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {formation_words.map((word, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${currentTheme.bg.replace('from-', 'from-opacity-50 from-').replace('to-', 'to-opacity-50 to-')} border ${currentTheme.border}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 語音按鈕 */}
      {showSpeaker && character && (
        <button
          onClick={handleSpeak}
          disabled={isCurrentlyPlaying(playerId)}
          className={`
            absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200
            ${currentTheme.speaker}
            ${isCurrentlyPlaying(playerId) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="點擊發音"
        >
          {isCurrentlyPlaying(playerId) ? (
            <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24l-4.24 4.24"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892zM7 8v4l2.659 2.773A1 1 0 0110 14V6a1 1 0 01-.341.773L7 8z"
                clipRule="evenodd"
              />
              <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
              <path d="M15.536.464a.5.5 0 00-.707.707 10.5 10.5 0 010 14.858.5.5 0 00.707.707 11.5 11.5 0 000-16.272z" />
            </svg>
          )}
        </button>
      )}

      {/* 載入動畫 */}
      {isCurrentlyPlaying(playerId) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-2xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 展示區域組件 - 橫向排列注音、拼音和播放按鈕（不顯示漢字）
 */
export function CharacterShowcase({ 
  character, 
  zhuyin,
  radical, // 新增部首
  formation_words = [], // 新增造詞陣列 
  zhuyinLayout = 'vertical',
  theme = 'default',
  className = ''
}) {
  const { playCharacterInfo, isCurrentlyPlaying } = useSpeech();
  const [pinyin, setPinyin] = useState('');
  const playerId = `character-showcase-${character}`;

  // 獲取拼音
  useEffect(() => {
    const getPinyin = async () => {
      try {
        // 嘗試使用 pinyin-pro 獲取拼音
        if (typeof window !== 'undefined' && window.pinyinPro && character) {
          const pinyinResult = window.pinyinPro.pinyin(character, { toneType: 'symbol' });
          setPinyin(pinyinResult || '');
        }
      } catch (error) {
        console.warn('獲取拼音失敗:', error);
        setPinyin('');
      }
    };

    if (character) {
      getPinyin();
    }
  }, [character]);

  // 語音播放 - 使用 SpeechContext
  const handleSpeak = async () => {
    if (isCurrentlyPlaying(playerId) || !character) return;
    
    await playCharacterInfo({
      character,
      // zhuyin,
      radical,
      formation_words,
      includeZhuyin: true,
      includeStrokeCount: false,
      playerId,
      rate: 0.8,
      pitch: 1.0,
    });
  };

  // 根據主題選擇樣式
  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'green':
        return {
          border: 'border-green-300',
          bg: 'bg-gradient-to-br from-green-50 to-gray-50',
          button: 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
        };
      case 'blue':
        return {
          border: 'border-blue-300',
          bg: 'bg-gradient-to-br from-blue-50 to-gray-50',
          button: 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
        };
      case 'purple':
        return {
          border: 'border-purple-300',
          bg: 'bg-gradient-to-br from-purple-50 to-gray-50',
          button: 'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600'
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
          button: 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
        };
    }
  };

  const themeStyles = getThemeStyles(theme);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要資訊區域 */}
      <div className="flex items-center justify-center gap-4">
        {/* 注音展示 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 mb-1">注音</span>
          <CharacterDisplay
            character=""
            zhuyin={zhuyin}
            layout={zhuyinLayout}
            size="medium"
            theme={theme}
            showCharacter={false}
            showSpeaker={false}
            showPronunciation={true}
            className="min-w-[80px] min-h-[60px] text-sm"
          />
        </div>

        {/* 拼音展示 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 mb-1">拼音</span>
          <div className={`
            rounded-xl border-2 ${themeStyles.border} ${themeStyles.bg}
            p-3 min-w-[80px] min-h-[60px] flex items-center justify-center
          `}>
            <span className="text-lg font-medium text-gray-800">
              {pinyin || '載入中...'}
            </span>
          </div>
        </div>

        {/* 播放按鈕 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 mb-1">發音</span>
          <button
            onClick={handleSpeak}
            disabled={isCurrentlyPlaying(playerId)}
            className={`
              w-14 h-14 rounded-full transition-all duration-200 shadow-md
              ${isCurrentlyPlaying(playerId) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : `${themeStyles.button} transform hover:scale-110`
              }
              flex items-center justify-center
            `}
            title="點擊發音"
          >
            {isCurrentlyPlaying(playerId) ? (
              <svg className="w-6 h-6 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24l-4.24 4.24"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892zM7 8v4l2.659 2.773A1 1 0 0110 14V6a1 1 0 01-.341.773L7 8z"
                  clipRule="evenodd"
                />
                <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
                <path d="M15.536.464a.5.5 0 00-.707.707 10.5 10.5 0 010 14.858.5.5 0 00.707.707 11.5 11.5 0 000-16.272z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 詳細資訊區域 */}
      {(radical || (formation_words && formation_words.length > 0)) && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-center gap-4">
            {/* 部首 */}
            {radical && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">部首</span>
                <div className={`
                  rounded-xl border-2 ${themeStyles.border} ${themeStyles.bg}
                  p-3 min-w-[80px] min-h-[60px] flex items-center justify-center
                `}>
                  <span className="text-lg font-medium">
                    <span className="text-purple-600">{radical}</span>
                    <span className="text-gray-800">部</span>
                  </span>
                </div>
              </div>
            )}
            
            {/* 造詞 */}
            {formation_words && formation_words.length > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">造詞</span>
                <div className={`
                  rounded-xl border-2 ${themeStyles.border} ${themeStyles.bg}
                  p-3 min-w-[120px] min-h-[60px] flex items-center justify-center
                `}>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-800 leading-tight">
                      {formation_words.slice(0, 3).join('・')}
                      {formation_words.length > 3 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 多字符顯示組件
 * 專門用於顯示多個漢字的注音
 */
export function MultiCharacterDisplay({ 
  characters = [], // [{ char: '字', zhuyin: 'ㄗˋ' }, ...]
  layout = 'horizontal',
  orientation = 'horizontal', // 字符排列方向 'horizontal' | 'vertical'
  size = 'medium',
  theme = 'default',
  className = '',
  onCharacterClick,
  maxPerRow = 4,
  showCharacter = true // 控制是否顯示漢字
}) {
  if (!characters.length) return null;

  return (
    <div className={`
      ${orientation === 'vertical' ? 'flex flex-col' : 'flex flex-wrap'} 
      gap-4 items-center justify-center ${className}
    `}>
      {characters.map((charData, index) => {
        // 每行最多顯示 maxPerRow 個字符
        const shouldBreak = orientation === 'horizontal' && 
                           index > 0 && 
                           index % maxPerRow === 0;
        
        return (
          <div key={index} className={shouldBreak ? 'w-full' : ''}>
            <CharacterDisplay
              character={charData.char}
              zhuyin={charData.zhuyin}
              layout={layout}
              size={size}
              theme={theme}
              showCharacter={showCharacter}
              onClick={onCharacterClick ? () => onCharacterClick(charData, index) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}