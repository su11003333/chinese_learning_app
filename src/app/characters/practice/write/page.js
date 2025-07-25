"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { speakText } from "@/utils/pronunciationService";
import { CharacterShowcase } from "@/components/ui/CharacterDisplay";

// 加载组件
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4 mx-auto"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
      </div>
    </div>
  );
}

// 将主要组件逻辑分离出来
function WritePracticeContent() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterList, setCharacterList] = useState([]);
  const [characterData, setCharacterData] = useState({}); // 儲存字符的注音等資料
  const [currentPhase, setCurrentPhase] = useState('animation'); // 'animation' | 'writing'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [showOutline] = useState(true);
  const [animationSpeed] = useState(1.5); // 調整為稍快的速度
  const [zhuyinLayout] = useState('vertical');
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [isShowingStrokeHint, setIsShowingStrokeHint] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [canvasSize, setCanvasSize] = useState(400);
  const [showStartModal, setShowStartModal] = useState(false);
  const [isFirstCharacterLoad, setIsFirstCharacterLoad] = useState(true);

  const writerRef = useRef(null);
  const hintWriterRef = useRef(null);
  const containerRef = useRef(null);
  const hintContainerRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 從 URL 參數獲取字符信息
  useEffect(() => {
    const char = searchParams.get("char");
    const chars = searchParams.get("chars");
    const charDataStr = searchParams.get("charData");
    const title = searchParams.get("title");

    if (char) {
      setSelectedCharacter(char);
    }

    if (chars) {
      setCharacterList(chars.split(""));
    }

    if (charDataStr) {
      try {
        const parsedCharData = JSON.parse(charDataStr);
        
        // 資料格式遷移：支援多種資料格式
        const migratedData = {};
        Object.keys(parsedCharData).forEach(char => {
          const charData = parsedCharData[char];
          if (typeof charData === 'string') {
            // 舊格式：字符直接對應注音字串
            migratedData[char] = {
              zhuyin: charData,
              radical: '',
              formation_words: [],
              strokeCount: 0,
              examples: []
            };
          } else if (typeof charData === 'object' && charData !== null) {
            // 新格式：字符對應物件（包含完整資料）
            migratedData[char] = {
              zhuyin: charData.zhuyin || '',
              radical: charData.radical || '',
              formation_words: charData.formation_words || [],
              strokeCount: charData.strokeCount || 0,
              examples: charData.examples || []
            };
          } else {
            // 預設值
            migratedData[char] = {
              zhuyin: '',
              radical: '',
              formation_words: [],
              strokeCount: 0,
              examples: []
            };
          }
        });
        
        setCharacterData(migratedData);
      } catch (error) {
        console.error("解析字符資料失敗:", error);
      }
    }

    if (title) {
      setLessonTitle(decodeURIComponent(title));
    }
  }, [searchParams]);

  // 動態載入 HanziWriter
  const loadHanziWriter = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.HanziWriter) {
        resolve(window.HanziWriter);
        return;
      }

      const script = document.createElement("script");
      script.src =
      
        "https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js";
      script.onload = () => {
        if (window.HanziWriter) {
          resolve(window.HanziWriter);
        } else {
          reject(new Error("HanziWriter failed to load"));
        }
      };
      script.onerror = () =>
        reject(new Error("Failed to load HanziWriter script"));
      document.head.appendChild(script);
    });
  };

  // 顯示筆畫提示動畫（只顯示一筆）
  const showStrokeHint = async (strokeIndex) => {
    if (!hintWriterRef.current || strokeIndex < 0) return;
    
    setIsShowingStrokeHint(true);
    
    try {
      // 清除提示畫布
      hintWriterRef.current.hideCharacter();
      
      // 等待一小段時間確保清除完成
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 只播放目標筆畫的動畫，不顯示之前的筆畫
      await new Promise(resolve => {
        hintWriterRef.current.animateStroke(strokeIndex, {
          duration: 1500, // 較慢的速度以突出顯示
          strokeColor: '#3b82f6', // 藍色突出顯示
          onComplete: resolve
        });
      });
      
      // 淡化提示
      setTimeout(() => {
        setIsShowingStrokeHint(false);
        // 完全隱藏提示
        if (hintWriterRef.current) {
          hintWriterRef.current.hideCharacter();
        }
      }, 2000);
      
    } catch (error) {
      console.warn('筆畫提示動畫失敗:', error);
      setIsShowingStrokeHint(false);
    }
  };

  // 初始化 HanziWriter
  const initializeWriter = async () => {
    if (!selectedCharacter || !containerRef.current || !hintContainerRef.current) return;

    // 清除現有的 writer
    if (writerRef.current) {
      writerRef.current = null;
    }
    if (hintWriterRef.current) {
      hintWriterRef.current = null;
    }

    // 清空容器
    containerRef.current.innerHTML = "";
    hintContainerRef.current.innerHTML = "";

    setLoading(true);
    setCurrentPhase('animation');
    setAnimationCompleted(false);

    try {
      const HanziWriter = await loadHanziWriter();

      // 主要書寫區域配置
      const dynamicCanvasSize = Math.min(window.innerWidth - 80, 500); // 最大500px，手機留80px邊距
      setCanvasSize(dynamicCanvasSize);
      const mainConfig = {
        width: dynamicCanvasSize,
        height: dynamicCanvasSize,
        padding: 30,
        strokeColor: "#8b5cf6",
        radicalColor: "#dc2626",
        strokeAnimationSpeed: animationSpeed,
        delayBetweenStrokes: 600 / animationSpeed,
        strokeFadeDuration: 500,
        drawingWidth: 6,
        showOutline: showOutline,
        showCharacter: currentPhase === 'animation',
        onLoadCharDataSuccess: () => {
          setLoading(false);
          if (isFirstCharacterLoad) {
            setMessage("字符載入成功！點擊開始練習來開始學習...");
            // 第一個字符顯示開始練習彈跳卡片
          } else {
            setMessage("字符載入成功！準備播放筆順動畫...");
            // 其他字符自動播放動畫和發音
            setTimeout(() => {
              playAnimationWithSound();
            }, 1000);
          }
        },
        onLoadCharDataError: () => {
          setLoading(false);
          setMessage(
            `無法載入字符 "${selectedCharacter}" 的筆順資料。請確認這是一個有效的中文字符。`
          );
        },
      };

      // 筆畫提示區域配置
      const hintConfig = {
        width: dynamicCanvasSize,
        height: dynamicCanvasSize,
        padding: 30,
        strokeColor: "#3b82f6",
        radicalColor: "#ef4444",
        drawingWidth: 4,
        showOutline: false,
        showCharacter: false,
        strokeAnimationSpeed: 0.8,
        delayBetweenStrokes: 300,
        userActionHandlers: {
          // 禁用所有用戶交互，避免影響提示顯示
          onPointerMove: () => {},
          onPointerDown: () => {},
          onPointerUp: () => {},
          onPointerEnter: () => {},
          onPointerLeave: () => {}
        }
      };

      // 創建主要書寫 writer
      writerRef.current = HanziWriter.create(
        containerRef.current,
        selectedCharacter,
        mainConfig
      );

      // 創建筆畫提示 writer
      hintWriterRef.current = HanziWriter.create(
        hintContainerRef.current,
        selectedCharacter,
        hintConfig
      );

    } catch (error) {
      setLoading(false);
      setMessage("載入字符時發生錯誤，請檢查網路連接後重試。");
      console.error("Error creating writer:", error);
    }
  };


  // 播放動畫並同時播放發音
  const playAnimationWithSound = (shouldPlayIntroduction = true) => {
    if (!writerRef.current || isPlaying) return;

    setIsPlaying(true);
    setMessage("正在播放筆順動畫...");
    setCurrentStroke(0);

    // 只有在需要時才播放字符介紹
    if (shouldPlayIntroduction) {
      playCharacterIntroduction();
    }

    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
        setAnimationCompleted(true);
        setMessage("動畫播放完成！準備開始寫字引導...");
        // 自動進入寫字引導
        setTimeout(() => {
          startWritingGuide();
        }, 2000);
      },
      onAnimateStroke: (strokeNum) => {
        setCurrentStroke(strokeNum + 1);
      },
    });
  };

  // 開始寫字引導
  const startWritingGuide = async () => {
    if (!writerRef.current) return;

    setCurrentPhase('writing');
    setIsQuizMode(true);
    setMessage("現在開始寫字引導！請根據筆順書寫字符。");

    // 重新配置 writer 為寫字模式
    writerRef.current.updateColor('strokeColor', '#10b981');
    writerRef.current.hideCharacter();
    setTimeout(() => {
      writerRef.current.showOutline();
    }, 500);

    writerRef.current.quiz({
      onMistake: (strokeData) => {
        setMessage(
          `第 ${strokeData.strokeNum + 1} 筆不正確，請重試！`
        );
      },
      onCorrectStroke: (strokeData) => {
        const remaining = strokeData.strokesRemaining;
        if (remaining > 0) {
          setMessage(`第 ${strokeData.strokeNum + 1} 筆正確！還剩 ${remaining} 筆。`);
          // 顯示下一筆的提示動畫
          const nextStrokeIndex = strokeData.strokeNum + 1;
          setTimeout(() => {
            showStrokeHint(nextStrokeIndex);
          }, 500);
        } else {
          setMessage(`第 ${strokeData.strokeNum + 1} 筆正確！準備完成...`);
        }
        setCurrentStroke(strokeData.strokeNum + 1);
      },
      onComplete: () => {
        setIsQuizMode(false);
        setCurrentStroke(0);
        setIsShowingStrokeHint(false);
        showCelebrationMessage();
      },
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      leniency: 1.2,
    });

    // 顯示第一筆的提示動畫
    setTimeout(() => {
      showStrokeHint(0);
    }, 1000);
  };

  // 顯示慶祝訊息
  const showCelebrationMessage = () => {
    setShowCelebration(true);
    setMessage("🎉 你真棒！完成了字符書寫練習！");
    
    // 播放慶祝語音
    speakText("你真棒", {
      lang: 'zh-TW',
      rate: 1.0,
      pitch: 1.2,
    }).catch(() => {});

    // modal不會自動隱藏，由用戶點擊按鈕決定
  };

  // 再播放一次動畫
  const replayAnimation = () => {
    if (!writerRef.current) return;
    
    setCurrentPhase('animation');
    setIsQuizMode(false);
    setAnimationCompleted(false);
    setShowCelebration(false);
    
    writerRef.current.cancelQuiz();
    writerRef.current.hideCharacter();
    writerRef.current.updateColor('strokeColor', '#8b5cf6');
    
    setTimeout(() => {
      writerRef.current.showCharacter();
      playAnimationWithSound();
    }, 500);
  };

  // 再寫一次
  const rewriteCharacter = () => {
    if (!writerRef.current) return;
    
    setCurrentPhase('writing');
    setIsQuizMode(false);
    setShowCelebration(false);
    setCurrentStroke(0);
    
    writerRef.current.cancelQuiz();
    writerRef.current.hideCharacter();
    
    setTimeout(() => {
      startWritingGuide();
    }, 500);
  };

  // 進行下個字
  const nextCharacter = () => {
    const currentIndex = characterList.indexOf(selectedCharacter);
    const nextIndex = (currentIndex + 1) % characterList.length;
    const nextChar = characterList[nextIndex];
    
    if (nextChar) {
      switchCharacter(nextChar);
    }
  };

  // 切換到其他字符
  const switchCharacter = (char) => {
    if (char === selectedCharacter) return; // 如果是同一個字符，不需要切換
    
    // 標記為非第一次載入
    setIsFirstCharacterLoad(false);
    
    // 重置所有狀態
    setCurrentPhase('animation');
    setIsQuizMode(false);
    setAnimationCompleted(false);
    setShowCelebration(false);
    setShowStartModal(false);
    setIsShowingStrokeHint(false);
    setCurrentStroke(0);
    setIsPlaying(false);
    
    // 更新URL但不重新整理頁面
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(""),
      charData: JSON.stringify(characterData),
      from: "practice",
    });
    
    // 保留課程標題
    if (lessonTitle) {
      params.set("title", encodeURIComponent(lessonTitle));
    }
    
    // 使用 replace 來更新URL而不重新整理頁面
    window.history.replaceState({}, '', `/characters/practice/write?${params.toString()}`);
    
    // 直接更新選中的字符，這會觸發 useEffect 重新初始化 writer
    setSelectedCharacter(char);
  };

  // 返回上一頁
  const backToList = () => {
    router.back();
  };

  // 當選擇的字符改變時，初始化 writer
  useEffect(() => {
    if (selectedCharacter) {
      const timer = setTimeout(() => {
        initializeWriter();
        // 只有第一個字符顯示開始練習彈跳卡片
        if (isFirstCharacterLoad) {
          setShowStartModal(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCharacter, animationSpeed]);

  // 播放字符介紹語音
  const playCharacterIntroduction = async (forcePlay = false) => {
    try {
      const charData = characterData[selectedCharacter];
      
      if (!charData) {
        console.warn('沒有找到字符資料:', selectedCharacter);
        return;
      }

      // 檢查是否為第一個字符，如果是則跳過自動播放（除非強制播放）
      const currentIndex = characterList.indexOf(selectedCharacter);
      const isFirstCharacter = currentIndex === 0;
      
      if (isFirstCharacter && !forcePlay) {
        console.log('這是第一個字符，跳過自動語音播放');
        return;
      }

      // 構建語音內容：漢字、部首、造詞、筆畫數（不包含注音）
      let speechText = selectedCharacter;
      
      // 部首
      if (charData.radical) {
        speechText += `，${charData.radical}部`;
      }
      
      // 造詞（只播放前幾個）
      if (charData.formation_words && charData.formation_words.length > 0) {
        const wordsToSpeak = charData.formation_words.slice(0, 3); // 只播放前3個造詞
        speechText += `，${wordsToSpeak.join('，')}`;
      }
      
      // 筆畫數（如果有的話）
      if (charData.strokeCount && charData.strokeCount > 0) {
        speechText += `，${charData.strokeCount}筆`;
      }
      
      await speakText(speechText, {
        lang: 'zh-TW',
        rate: 0.7,
        pitch: 1.0,
      });
    } catch (error) {
      console.warn('自動語音播放失敗:', error);
    }
  };

  // 開始練習
  const startPractice = () => {
    setShowStartModal(false);
    setIsFirstCharacterLoad(false); // 標記已經不是第一次載入
    // 播放第一個字的語音（強制播放）
    playCharacterIntroduction(true);
    // 稍微延遲後播放動畫（不再播放介紹，因為已經播放過了）
    setTimeout(() => {
      playAnimationWithSound(false);
    }, 2000);
  };


  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
          <button
            onClick={backToList}
            className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            返回上一頁
          </button>
        </div>
      </div>
    );
  }

  // 準備字符數據用於多字符顯示組件
  const otherCharacters = characterList.map(char => {
    const charData = characterData[char];
    return {
      char: char,
      zhuyin: charData?.zhuyin || '',
      radical: charData?.radical || '',
      formation_words: charData?.formation_words || []
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      
      {/* 主要內容區域 */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側練習區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {currentPhase === 'animation' ? '筆順動畫演示' : '寫字練習'}
                </h2>

                {/* 書寫/動畫區域 */}
                <div className="flex justify-center mb-6 w-full">
                  <div className="relative" style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}>
                    <div className="border-4 border-dashed border-gray-300 rounded-3xl bg-gradient-to-br from-gray-50 to-purple-50 w-full h-full relative">
                      {/* 全課程進度條 */}
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="bg-white bg-opacity-90 rounded-full px-3 py-1">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>課程進度</span>
                            <span>{characterList.indexOf(selectedCharacter) + 1}/{characterList.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${((characterList.indexOf(selectedCharacter) + 1) / characterList.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {/* 筆畫提示層 - 修正定位，與主書寫區域完全對齊 */}
                      <div className="absolute inset-0 pointer-events-none z-20" style={{ pointerEvents: 'none' }}>
                        <div
                          ref={hintContainerRef}
                          className={`w-full h-full transition-opacity duration-500 ${
                            isShowingStrokeHint ? 'opacity-80' : 'opacity-0'
                          }`}
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))', // 藍色陰影效果
                            pointerEvents: 'none', // 確保完全不接收指針事件
                            userSelect: 'none', // 禁用文字選擇
                            WebkitUserSelect: 'none', // Safari 支持
                            MozUserSelect: 'none', // Firefox 支持
                            marginLeft: '1px', // 修正偏移問題 - 往左1px
                            marginTop: '-3px', // 往上1px
                          }}
                        >
                        </div>
                      </div>
                      
                      {/* 主要書寫區域 */}
                      <div
                        ref={containerRef}
                        className="flex justify-center items-center relative z-10 w-full h-full"
                      >
                        {loading && (
                          <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-gray-600 font-medium">
                              載入中...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 階段指示器 */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium">
                      {currentPhase === 'animation' ? (
                        <div className="bg-purple-500 text-white animate-pulse">
                          {isPlaying ? '播放中' : '動畫階段'}
                        </div>
                      ) : (
                        <div className="bg-green-500 text-white animate-pulse">
                          {isQuizMode ? '練習中' : '寫字階段'}
                        </div>
                      )}
                    </div>

                    {/* 筆畫提示指示器 */}
                    {isShowingStrokeHint && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        筆畫提示
                      </div>
                    )}

                    {/* 開始練習彈跳卡片 */}
                    {showStartModal && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-3xl z-50">
                        <div className="bg-white p-8 rounded-2xl text-center shadow-2xl border-2 border-purple-200 max-w-md">
                          <div className="text-6xl mb-4">✨</div>
                          <div className="text-2xl font-bold text-purple-600 mb-2">開始練習「{selectedCharacter}」</div>
                          {characterData[selectedCharacter] && (
                            <div className="text-gray-600 mb-4">
                              {characterData[selectedCharacter].zhuyin && (
                                <div className="text-lg mb-2">注音：{characterData[selectedCharacter].zhuyin}</div>
                              )}
                              {characterData[selectedCharacter].radical && (
                                <div className="text-sm mb-1">部首：{characterData[selectedCharacter].radical}部</div>
                              )}
                              {characterData[selectedCharacter].formation_words && characterData[selectedCharacter].formation_words.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  造詞：{characterData[selectedCharacter].formation_words.slice(0, 3).join('、')}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-gray-600 mb-6">
                            準備好了嗎？我們來學習這個字的筆順！
                          </div>
                          <button
                            onClick={startPractice}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
                          >
                            🚀 開始練習
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 慶祝訊息 */}
                    {showCelebration && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-3xl z-50">
                        <div className="bg-white p-8 rounded-2xl text-center shadow-2xl border-2 border-purple-200">
                          <div className="text-6xl mb-4">🎉</div>
                          <div className="text-2xl font-bold text-purple-600">你真棒！</div>
                          <div className="text-gray-600 mt-2 mb-6">你會寫「{selectedCharacter}」了！</div>
                          <div className="flex space-x-3 justify-center">
                            <button
                              onClick={() => {
                                setShowCelebration(false);
                                rewriteCharacter();
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              再寫一次
                            </button>
                            <button
                              onClick={() => {
                                setShowCelebration(false);
                                nextCharacter();
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              進行下個字
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按鈕 - 常駐顯示 */}
                <div className="mb-6">
                  <div className="flex justify-center space-x-3">
                    {currentPhase === 'animation' && (
                      <button
                        onClick={playAnimationWithSound}
                        disabled={isPlaying}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {isPlaying ? '播放中...' : '再播放一次'}
                      </button>
                    )}
                    
                    {currentPhase === 'writing' && (
                      <button
                        onClick={replayAnimation}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        再看一次動畫
                      </button>
                    )}
                    
                    {/* 常駐按鈕 */}
                    <button
                      onClick={rewriteCharacter}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      再寫一次
                    </button>
                    <button
                      onClick={nextCharacter}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      進行下個字
                    </button>
                  </div>
                </div>

                {/* 訊息顯示 */}
                {message && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl">
                    <div className="flex items-start justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-500 mr-3 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-purple-800 font-medium text-center">
                        {message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右側控制面板 */}
          <div className="space-y-6">
            {/* 控制按鈕 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
              <button
                onClick={backToList}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                返回上一頁
              </button>
            </div>

            {/* 字符展示區域 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                當前學習字符
              </h3>
              <div className="flex justify-center">
                <CharacterShowcase
                  character={selectedCharacter}
                  zhuyin={characterData[selectedCharacter]?.zhuyin || ''}
                  radical={characterData[selectedCharacter]?.radical || ''}
                  formation_words={characterData[selectedCharacter]?.formation_words || []}
                  zhuyinLayout={zhuyinLayout}
                  theme="purple"
                  className="w-full max-w-sm"
                />
              </div>
            </div>


          </div>
        </div>

        {/* 底部字符選擇器 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              本課生字練習
            </h3>
            {lessonTitle && (
              <p className="text-sm text-gray-600 mt-1">
                課程：{lessonTitle}
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {otherCharacters.map((charData, index) => (
                <button
                  key={index}
                  onClick={() => switchCharacter(charData.char)}
                  className={`flex-shrink-0 w-32 h-28 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    charData.char === selectedCharacter
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {charData.char}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {charData.zhuyin}
                    </div>
                    {charData.radical && (
                      <div className="text-xs text-purple-600 font-medium">
                        {charData.radical}部
                      </div>
                    )}
                    {charData.formation_words && charData.formation_words.length > 0 && (
                      <div className="text-xs text-gray-500 text-center leading-tight mt-1">
                        {charData.formation_words.slice(0, 2).join('・')}
                        {charData.formation_words.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主导出组件，包裹在 Suspense 中
export default function WritePractice() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <WritePracticeContent />
    </Suspense>
  );
}