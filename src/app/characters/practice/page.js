// src/app/characters/practice/page.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function CharacterPractice() {
  // 狀態管理
  const [inputText, setInputText] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentMode, setCurrentMode] = useState('input'); // 'input', 'list', 'practice'
  const [practiceMode, setPracticeMode] = useState('demo'); // 'demo', 'quiz'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  
  // HanziWriter 相關狀態
  const writerRef = useRef(null);
  const containerRef = useRef(null);

  // 從輸入文字提取漢字
  const extractCharacters = (text) => {
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    return chineseChars ? [...new Set(chineseChars)] : [];
  };

  // 處理輸入提
  const handleInputSubmit = () => {
    const chars = extractCharacters(inputText);
    if (chars.length === 0) {
      setMessage('請輸入包含中文字符的文字！');
      return;
    }
    setCharacterList(chars);
    setCurrentMode('list');
    setMessage('');
  };

  // 選擇字符進入練習模式
  const selectCharacter = (char) => {
    setSelectedCharacter(char);
    setCurrentMode('practice');
    setPracticeMode('demo');
    setIsQuizMode(false);
    setMessage('');
    setCurrentStroke(0);
  };

  // 動態載入 HanziWriter
  const loadHanziWriter = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.HanziWriter) {
        resolve(window.HanziWriter);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
      script.onload = () => {
        if (window.HanziWriter) {
          resolve(window.HanziWriter);
        } else {
          reject(new Error('HanziWriter failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load HanziWriter script'));
      document.head.appendChild(script);
    });
  };

  // 初始化 HanziWriter
  const initializeWriter = async () => {
    if (!selectedCharacter || !containerRef.current) return;

    // 清除現有的 writer
    if (writerRef.current) {
      writerRef.current = null;
    }

    // 清空容器
    containerRef.current.innerHTML = '';

    setLoading(true);

    try {
      const HanziWriter = await loadHanziWriter();
      
      // 根據當前模式創建不同配置的 writer
      const config = {
        width: 400,
        height: 400,
        padding: 30,
        strokeColor: '#2563eb',
        radicalColor: '#dc2626',
        strokeAnimationSpeed: animationSpeed,
        delayBetweenStrokes: 400 / animationSpeed,
        strokeFadeDuration: 500,
        drawingWidth: 6,
        showOutline: showOutline,
        onLoadCharDataSuccess: () => {
          setLoading(false);
          setMessage(`字符 "${selectedCharacter}" 載入成功！`);
          if (practiceMode === 'demo') {
            setMessage('點擊播放按鈕觀看筆順演示，或切換到練習模式開始書寫。');
          }
        },
        onLoadCharDataError: () => {
          setLoading(false);
          setMessage(`無法載入字符 "${selectedCharacter}" 的筆順資料。請確認這是一個有效的中文字符。`);
        },
      };

      // 練習模式的特殊配置
      if (practiceMode === 'quiz') {
        config.showCharacter = false;
        config.showHintAfterMisses = showHints ? 2 : false; // 2次錯誤後顯示提示
        config.highlightOnComplete = true;
        config.leniency = 1.2; // 增加容錯度
        config.markStrokeCorrectAfterMisses = 5; // 5次錯誤後自動標記正確
      }

      writerRef.current = HanziWriter.create(containerRef.current, selectedCharacter, config);

    } catch (error) {
      setLoading(false);
      setMessage('載入字符時發生錯誤，請檢查網路連接後重試。');
      console.error('Error creating writer:', error);
    }
  };

  // 切換練習模式
  const switchMode = async (mode) => {
    if (mode === practiceMode) return;
    
    setPracticeMode(mode);
    setIsQuizMode(false);
    setCurrentStroke(0);
    
    // 重新初始化 writer
    setTimeout(() => {
      initializeWriter();
    }, 100);
  };

  // 播放筆順動畫
  const playAnimation = () => {
    if (!writerRef.current || isPlaying || practiceMode !== 'demo') return;
    
    setIsPlaying(true);
    setMessage('正在播放筆順動畫...');
    setCurrentStroke(0);
    
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
        setMessage('筆順動畫播放完成！可以切換到練習模式開始書寫。');
      },
      onAnimateStroke: (strokeNum) => {
        setCurrentStroke(strokeNum + 1);
      }
    });
  };

  // 逐步播放筆順
  const playStrokeByStroke = () => {
    if (!writerRef.current || practiceMode !== 'demo') return;
    
    writerRef.current.animateStroke(currentStroke, {
      onComplete: () => {
        setMessage(`第 ${currentStroke + 1} 筆播放完成`);
      }
    });
  };

  // 上一筆/下一筆
  const navigateStroke = (direction) => {
    if (!writerRef.current || practiceMode !== 'demo') return;
    
    const maxStrokes = writerRef.current._character?.strokes?.length || 0;
    let newStroke = currentStroke;
    
    if (direction === 'prev' && currentStroke > 0) {
      newStroke = currentStroke - 1;
    } else if (direction === 'next' && currentStroke < maxStrokes - 1) {
      newStroke = currentStroke + 1;
    }
    
    if (newStroke !== currentStroke) {
      setCurrentStroke(newStroke);
      writerRef.current.animateStroke(newStroke);
      setMessage(`正在播放第 ${newStroke + 1} 筆`);
    }
  };

  // 開始練習模式
  const startQuiz = () => {
    if (!writerRef.current || practiceMode !== 'quiz') return;
    
    setIsQuizMode(true);
    setMessage('請根據筆順書寫字符。按正確的筆順，從起始點開始畫筆畫。');
    
    writerRef.current.quiz({
      onMistake: (strokeData) => {
        const hintText = showHints ? '提示將在2次錯誤後顯示。' : '';
        setMessage(`第 ${strokeData.strokeNum + 1} 筆不正確，請重試！${hintText} 錯誤次數：${strokeData.mistakesOnStroke}`);
      },
      onCorrectStroke: (strokeData) => {
        const remaining = strokeData.strokesRemaining;
        if (remaining > 0) {
          setMessage(`第 ${strokeData.strokeNum + 1} 筆正確！還剩 ${remaining} 筆。`);
        } else {
          setMessage(`第 ${strokeData.strokeNum + 1} 筆正確！準備完成...`);
        }
        setCurrentStroke(strokeData.strokeNum + 1);
      },
      onComplete: (summaryData) => {
        setMessage(`🎉 恭喜！成功完成 "${summaryData.character}" 的書寫練習！總共犯了 ${summaryData.totalMistakes} 個錯誤。`);
        setIsQuizMode(false);
        setCurrentStroke(0);
        // 5秒後自動隱藏完成訊息
        setTimeout(() => {
          setMessage('練習完成！可以選擇其他字符繼續練習。');
        }, 5000);
      },
      showHintAfterMisses: showHints ? 2 : false,
      highlightOnComplete: true,
      leniency: 1.2
    });
  };

  // 重置練習
  const resetPractice = () => {
    if (writerRef.current) {
      if (isQuizMode) {
        writerRef.current.cancelQuiz();
      }
      writerRef.current.hideCharacter();
      // 重新顯示字符（如果在演示模式）
      if (practiceMode === 'demo') {
        setTimeout(() => {
          writerRef.current.showCharacter();
        }, 100);
      }
    }
    setIsQuizMode(false);
    setCurrentStroke(0);
    setMessage('已重置，可以重新開始。');
    setTimeout(() => setMessage(''), 2000);
  };

  // 顯示/隱藏字符輪廓
  const toggleOutline = () => {
    const newShowOutline = !showOutline;
    setShowOutline(newShowOutline);
    
    if (writerRef.current) {
      if (newShowOutline) {
        writerRef.current.showOutline();
      } else {
        writerRef.current.hideOutline();
      }
    }
    
    setMessage(newShowOutline ? '已顯示字符輪廓' : '已隱藏字符輪廓');
    setTimeout(() => setMessage(''), 1500);
  };

  // 切換提示功能
  const toggleHints = () => {
    setShowHints(!showHints);
    setMessage(!showHints ? '已啟用筆畫提示功能' : '已關閉筆畫提示功能');
    setTimeout(() => setMessage(''), 1500);
  };

  // 更新動畫速度
  const updateAnimationSpeed = (speed) => {
    setAnimationSpeed(speed);
    // 需要重新創建 writer 來應用新速度
    setTimeout(() => {
      initializeWriter();
    }, 100);
  };

  // 返回字符列表
  const backToList = () => {
    setCurrentMode('list');
    setSelectedCharacter(null);
    setPracticeMode('demo');
    setMessage('');
    setCurrentStroke(0);
    if (writerRef.current) writerRef.current = null;
  };

  // 返回輸入頁面
  const backToInput = () => {
    setCurrentMode('input');
    setCharacterList([]);
    setSelectedCharacter(null);
    setInputText('');
    setPracticeMode('demo');
    setMessage('');
    setCurrentStroke(0);
    if (writerRef.current) writerRef.current = null;
  };

  // 當選擇的字符或模式改變時，初始化 writer
  useEffect(() => {
    if (selectedCharacter && currentMode === 'practice') {
      const timer = setTimeout(() => {
        initializeWriter();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCharacter, currentMode, practiceMode]);

  // 渲染輸入界面
  const renderInputMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              漢字筆順練習
            </h1>
            <p className="text-gray-600">
              輸入您想要練習的中文文字，開始學習正確的筆順
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                輸入中文文字
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows="4"
                placeholder="例如：我愛學習中文，每天都要練習寫字。"
              />
              <p className="text-sm text-gray-500 mt-1">
                {inputText.trim() ? `已輸入 ${inputText.length} 個字符` : '請輸入包含中文字符的文字'}
              </p>
            </div>
            
            <button
              onClick={handleInputSubmit}
              disabled={!inputText.trim()}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              提取漢字
            </button>
            
            {message && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-800">{message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染字符列表
  const renderListMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">選擇要練習的漢字</h2>
              <p className="text-gray-600 mt-1">
                從您輸入的文字中找到了 {characterList.length} 個不同的漢字
              </p>
            </div>
            <button
              onClick={backToInput}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              ← 重新輸入
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {characterList.map((char, index) => (
              <button
                key={index}
                onClick={() => selectCharacter(char)}
                className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex items-center justify-center group transform hover:scale-105"
              >
                <span className="text-4xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                  {char}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              點擊任意漢字開始練習筆順
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染練習界面（App風格）
  const renderPracticeMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={backToList}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">練習字符</h1>
              <p className="text-sm text-gray-500">正在練習：{selectedCharacter}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 模式切換按鈕 */}
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => switchMode('demo')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  practiceMode === 'demo'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                演示
              </button>
              <button
                onClick={() => switchMode('quiz')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  practiceMode === 'quiz'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                練習
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側練習區域 - 佔據更大空間 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    {selectedCharacter}
                  </span>
                  {practiceMode === 'demo' ? '筆順演示' : '書寫練習'}
                </h2>
                
                {/* 書寫區域 */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="border-4 border-dashed border-gray-300 rounded-3xl p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                      <div ref={containerRef} className="flex justify-center items-center">
                        {loading && (
                          <div className="w-[400px] h-[400px] flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 font-medium">載入中...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 當前筆畫指示器 */}
                    {practiceMode === 'demo' && currentStroke > 0 && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        第 {currentStroke} 筆
                      </div>
                    )}
                    
                    {/* 練習模式指示器 */}
                    {practiceMode === 'quiz' && isQuizMode && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        練習中
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 訊息顯示 */}
                {message && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-blue-800 font-medium text-center">{message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右側控制面板 */}
          <div className="space-y-6">
            {/* 主要控制按鈕 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">操作控制</h3>
              
              {practiceMode === 'demo' ? (
                <div className="space-y-3">
                  <button
                    onClick={playAnimation}
                    disabled={isPlaying || loading}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {isPlaying ? '播放中...' : '播放完整筆順'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateStroke('prev')}
                      disabled={currentStroke === 0 || loading}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      ← 上一筆
                    </button>
                    <button
                      onClick={() => navigateStroke('next')}
                      disabled={loading}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      下一筆 →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startQuiz}
                    disabled={isQuizMode || loading}
                    className="w-full py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" clipRule="evenodd" />
                    </svg>
                    {isQuizMode ? '練習中...' : '開始書寫練習'}
                  </button>
                </div>
              )}
              
              <button
                onClick={resetPractice}
                disabled={loading}
                className="w-full mt-3 py-2 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                重置
              </button>
            </div>

            {/* 設置面板 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">設置選項</h3>
              
              <div className="space-y-4">
                {/* 輪廓控制 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">顯示字符輪廓</span>
                  <button
                    onClick={toggleOutline}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showOutline ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showOutline ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 提示控制 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">筆畫起始提示</span>
                  <button
                    onClick={toggleHints}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showHints ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showHints ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 動畫速度 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">動畫速度</span>
                    <span className="text-xs text-gray-500">
                      {animationSpeed === 0.5 ? '慢' : animationSpeed === 1 ? '中' : '快'}
                    </span>
                  </div>
                  <select
                    value={animationSpeed}
                    onChange={(e) => updateAnimationSpeed(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0.5}>慢速</option>
                    <option value={1}>中速</option>
                    <option value={2}>快速</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 練習進度 */}
            {practiceMode === 'quiz' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">練習進度</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">當前筆畫</span>
                    <span className="font-medium">{currentStroke + 1}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${writerRef.current?._character?.strokes?.length 
                          ? (currentStroke / writerRef.current._character.strokes.length) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    完成度：{writerRef.current?._character?.strokes?.length 
                      ? Math.round((currentStroke / writerRef.current._character.strokes.length) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            )}

            {/* 使用提示 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💡 使用提示</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {practiceMode === 'demo' ? (
                  <>
                    <p>• 點擊「播放完整筆順」觀看動畫</p>
                    <p>• 使用「上一筆/下一筆」逐步學習</p>
                    <p>• 切換到練習模式開始書寫</p>
                  </>
                ) : (
                  <>
                    <p>• 用鼠標或觸控筆按筆順書寫</p>
                    <p>• 啟用提示功能會在錯誤後顯示起始點</p>
                    <p>• 注意筆畫的起始位置和方向</p>
                    <p>• 可調整容錯度和顯示設置</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentMode === 'input' && renderInputMode()}
      {currentMode === 'list' && renderListMode()}
      {currentMode === 'practice' && renderPracticeMode()}
    </>
  );
} 