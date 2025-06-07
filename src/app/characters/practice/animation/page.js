"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { speakText } from "@/utils/pronunciationService";
import CharacterDisplay, { MultiCharacterDisplay, CharacterShowcase } from "@/components/ui/CharacterDisplay";

// 加载组件
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4 mx-auto"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
      </div>
    </div>
  );
}

// 将主要组件逻辑分离出来
function AnimationPracticeContent() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterList, setCharacterList] = useState([]);
  const [characterData, setCharacterData] = useState({}); // 儲存字符的注音等資料
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [zhuyinLayout, setZhuyinLayout] = useState('vertical'); // 'horizontal' | 'vertical'
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);

  const writerRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 從 URL 參數獲取字符信息
  useEffect(() => {
    const char = searchParams.get("char");
    const chars = searchParams.get("chars");
    const charDataStr = searchParams.get("charData");

    if (char) {
      setSelectedCharacter(char);
    }

    if (chars) {
      setCharacterList(chars.split(""));
    }

    if (charDataStr) {
      try {
        const parsedCharData = JSON.parse(charDataStr);
        setCharacterData(parsedCharData);
      } catch (error) {
        console.error("解析字符資料失敗:", error);
      }
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

  // 初始化 HanziWriter
  const initializeWriter = async () => {
    if (!selectedCharacter || !containerRef.current) return;

    // 清除現有的 writer
    if (writerRef.current) {
      writerRef.current = null;
    }

    // 清空容器
    containerRef.current.innerHTML = "";

    setLoading(true);

    try {
      const HanziWriter = await loadHanziWriter();

      const config = {
        width: 400,
        height: 400,
        padding: 30,
        strokeColor: "#2563eb",
        radicalColor: "#dc2626",
        strokeAnimationSpeed: animationSpeed,
        delayBetweenStrokes: 400 / animationSpeed,
        strokeFadeDuration: 500,
        drawingWidth: 6,
        showOutline: showOutline,
        onLoadCharDataSuccess: () => {
          setLoading(false);
          setMessage(
            `字符 "${selectedCharacter}" 載入成功！點擊播放按鈕觀看筆順演示。`
          );
        },
        onLoadCharDataError: () => {
          setLoading(false);
          setMessage(
            `無法載入字符 "${selectedCharacter}" 的筆順資料。請確認這是一個有效的中文字符。`
          );
        },
      };

      writerRef.current = HanziWriter.create(
        containerRef.current,
        selectedCharacter,
        config
      );
    } catch (error) {
      setLoading(false);
      setMessage("載入字符時發生錯誤，請檢查網路連接後重試。");
      console.error("Error creating writer:", error);
    }
  };

  // 播放筆順動畫
  const playAnimation = () => {
    if (!writerRef.current || isPlaying) return;

    setIsPlaying(true);
    setMessage("正在播放筆順動畫...");
    setCurrentStroke(0);

    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
        setMessage("筆順動畫播放完成！可以切換到其他字符或書寫練習。");
      },
      onAnimateStroke: (strokeNum) => {
        setCurrentStroke(strokeNum + 1);
      },
    });
  };

  // 逐步播放筆順
  const playStrokeByStroke = () => {
    if (!writerRef.current) return;

    writerRef.current.animateStroke(currentStroke, {
      onComplete: () => {
        setMessage(`第 ${currentStroke + 1} 筆播放完成`);
      },
    });
  };

  // 上一筆/下一筆
  const navigateStroke = (direction) => {
    if (!writerRef.current) return;

    const maxStrokes = writerRef.current._character?.strokes?.length || 0;
    let newStroke = currentStroke;

    if (direction === "prev" && currentStroke > 0) {
      newStroke = currentStroke - 1;
    } else if (direction === "next" && currentStroke < maxStrokes - 1) {
      newStroke = currentStroke + 1;
    }

    if (newStroke !== currentStroke) {
      setCurrentStroke(newStroke);
      writerRef.current.animateStroke(newStroke);
      setMessage(`正在播放第 ${newStroke + 1} 筆`);
    }
  };

  // 重置動畫
  const resetAnimation = () => {
    if (writerRef.current) {
      writerRef.current.hideCharacter();
      setTimeout(() => {
        writerRef.current.showCharacter();
      }, 100);
    }
    setCurrentStroke(0);
    setMessage("已重置，可以重新開始。");
    setTimeout(() => setMessage(""), 2000);
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

    setMessage(newShowOutline ? "已顯示字符輪廓" : "已隱藏字符輪廓");
    setTimeout(() => setMessage(""), 1500);
  };

  // 切換注音顯示方式
  const toggleZhuyinLayout = () => {
    const newLayout = zhuyinLayout === 'vertical' ? 'horizontal' : 'vertical';
    setZhuyinLayout(newLayout);
    setMessage(newLayout === 'vertical' ? "已切換到直立注音" : "已切換到橫向注音");
    setTimeout(() => setMessage(""), 1500);
  };

  // 更新動畫速度
  const updateAnimationSpeed = (speed) => {
    setAnimationSpeed(speed);
    // 需要重新創建 writer 來應用新速度
    setTimeout(() => {
      initializeWriter();
    }, 100);
  };

  // 切換到其他字符
  const switchCharacter = (char) => {
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(""),
      charData: JSON.stringify(characterData),
      from: "practice",
    });
    router.push(`/characters/practice/animation?${params.toString()}`);
  };

  // 跳轉到書寫練習
  const goToWriting = () => {
    const params = new URLSearchParams({
      char: selectedCharacter,
      chars: characterList.join(""),
      charData: JSON.stringify(characterData),
      from: "practice",
    });
    router.push(`/characters/practice/writing?${params.toString()}`);
  };

  // 返回字符選擇頁面
  const backToList = () => {
    router.push("/characters/practice");
  };

  // 當選擇的字符改變時，初始化 writer
  useEffect(() => {
    if (selectedCharacter) {
      const timer = setTimeout(() => {
        initializeWriter();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCharacter, animationSpeed]);

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
          <button
            onClick={backToList}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            返回字符選擇
          </button>
        </div>
      </div>
    );
  }

  // 準備字符數據用於多字符顯示組件
  const otherCharacters = characterList
    .filter(char => char !== selectedCharacter)
    .map(char => ({
      char: char,
      zhuyin: characterData[char] || ''
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={backToList}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
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
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">筆順動畫演示</h1>
              <p className="text-sm text-gray-500">
                正在學習：{selectedCharacter}{" "}
                {characterData[selectedCharacter] &&
                  `(${characterData[selectedCharacter]})`}
              </p>
            </div>
          </div>

          <button
            onClick={goToWriting}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-medium rounded-full hover:from-green-500 hover:to-green-600 transition-all duration-200"
          >
            切換到書寫練習
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側演示區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">筆順動畫演示</h2>
                
                {/* 展示區域 - 縮小比例，只顯示注音、拼音和播放按鈕 */}
                <div className="mb-4 flex justify-center">
                  <CharacterShowcase
                    character={selectedCharacter}
                    zhuyin={characterData[selectedCharacter]}
                    zhuyinLayout={zhuyinLayout}
                    theme="blue"
                    className="w-full max-w-md"
                  />
                </div>

                {/* 動畫區域 */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="border-4 border-dashed border-gray-300 rounded-3xl p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                      <div
                        ref={containerRef}
                        className="flex justify-center items-center"
                      >
                        {loading && (
                          <div className="w-[400px] h-[400px] flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 font-medium">
                              載入中...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 當前筆畫指示器 */}
                    {currentStroke > 0 && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        第 {currentStroke} 筆
                      </div>
                    )}

                    {/* 播放指示器 */}
                    {isPlaying && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        播放中
                      </div>
                    )}
                  </div>
                </div>

                {/* 訊息顯示 */}
                {message && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-blue-800 font-medium text-center">
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
            {/* 主要控制按鈕 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">播放控制</h3>

              <div className="space-y-3">
                <button
                  onClick={playAnimation}
                  disabled={isPlaying || loading}
                  className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isPlaying ? "播放中..." : "播放完整筆順"}
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateStroke("prev")}
                    disabled={currentStroke === 0 || loading}
                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                  >
                    ← 上一筆
                  </button>
                  <button
                    onClick={() => navigateStroke("next")}
                    disabled={loading}
                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                  >
                    下一筆 →
                  </button>
                </div>

                <button
                  onClick={resetAnimation}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  重置
                </button>
              </div>
            </div>

            {/* 設置面板 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">設置選項</h3>

              <div className="space-y-4">
                {/* 輪廓控制 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    顯示字符輪廓
                  </span>
                  <button
                    onClick={toggleOutline}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showOutline ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showOutline ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 注音顯示方式 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    直立注音顯示
                  </span>
                  <button
                    onClick={toggleZhuyinLayout}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      zhuyinLayout === 'vertical' ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        zhuyinLayout === 'vertical' ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 動畫速度 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      動畫速度
                    </span>
                    <span className="text-xs text-gray-500">
                      {animationSpeed === 0.5
                        ? "慢"
                        : animationSpeed === 1
                        ? "中"
                        : "快"}
                    </span>
                  </div>
                  <select
                    value={animationSpeed}
                    onChange={(e) =>
                      updateAnimationSpeed(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0.5}>慢速</option>
                    <option value={1}>中速</option>
                    <option value={2}>快速</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 其他字符快速切換 - 只顯示注音 */}
            {otherCharacters.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  快速切換字符
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {otherCharacters.slice(0, 6).map((charData, index) => (
                    <div key={index} className="flex flex-col">
                      <button
                        onClick={() => switchCharacter(charData.char)}
                        className="relative aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50 transition-all duration-200 p-3 cursor-pointer hover:shadow-lg transform hover:scale-105"
                      >
                        {/* 注音顯示 */}
                        <div className="flex items-center justify-center h-full">
                          {charData.zhuyin ? (
                            zhuyinLayout === 'vertical' ? (
                              // 直立注音
                              <div className="relative flex flex-col items-center justify-center">
                                {(() => {
                                  const zhuyin = charData.zhuyin;
                                  const toneMarks = ['ˊ', 'ˇ', 'ˋ', '˙'];
                                  let mainChars = '';
                                  let tone = '';
                                  
                                  for (let i = 0; i < zhuyin.length; i++) {
                                    const char = zhuyin[i];
                                    if (toneMarks.includes(char)) {
                                      tone = char;
                                    } else {
                                      mainChars += char;
                                    }
                                  }
                                  
                                  return (
                                    <>
                                      {/* 輕聲在上方 */}
                                      {tone === '˙' && (
                                        <span
                                          className="text-sm text-blue-600 font-medium leading-none absolute"
                                          style={{ 
                                            top: '-0.2em',
                                            left: '50%',
                                            transform: 'translateX(-50%)'
                                          }}
                                        >
                                          {tone}
                                        </span>
                                      )}
                                      
                                      {/* 主要注音字符 */}
                                      <div className="flex flex-col items-center">
                                        {mainChars.split('').map((char, idx) => (
                                          <span
                                            key={idx}
                                            className="text-sm text-blue-600 font-medium leading-tight"
                                            style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                                          >
                                            {char}
                                          </span>
                                        ))}
                                      </div>
                                      
                                      {/* 二三四聲在右側 */}
                                      {tone && tone !== '˙' && (
                                        <span
                                          className="text-sm text-blue-600 font-medium leading-none absolute"
                                          style={{ 
                                            right: '-0.3em',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                          }}
                                        >
                                          {tone}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              // 橫向注音
                              <span className="text-sm text-blue-600 font-medium">
                                {charData.zhuyin}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">無注音</span>
                          )}
                        </div>
                        
                        {/* 語音按鈕 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(charData.char, {
                              lang: 'zh-TW',
                              rate: 0.8,
                              pitch: 1.0,
                            }).catch(() => {});
                          }}
                          className="absolute top-1 right-1 p-1 text-blue-400 hover:text-blue-600 rounded transition-colors"
                          title="發音"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892z"
                              clipRule="evenodd"
                            />
                            <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
                          </svg>
                        </button>
                        
                        {/* 字符提示 (小字顯示在下方) */}
                        <div className="absolute bottom-1 left-1 text-xs text-gray-500 font-medium">
                          {charData.char}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
                {otherCharacters.length > 6 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500">
                      還有 {otherCharacters.length - 6} 個字符...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 使用提示 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                💡 使用提示
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 點擊「播放完整筆順」觀看完整動畫</p>
                <p>• 使用「上一筆/下一筆」逐步學習每個筆畫</p>
                <p>• 可以調整動畫速度來適應學習節奏</p>
                <p>• 切換注音顯示方式：橫向或直立</p>
                <p>• 點擊漢字可聽取正確發音</p>
                <p>• 點擊上方按鈕切換到書寫練習模式</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主导出组件，包裹在 Suspense 中
export default function AnimationPractice() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <AnimationPracticeContent />
    </Suspense>
  );
}