"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { speakText } from "@/utils/pronunciationService";

export default function WritingPractice() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterList, setCharacterList] = useState([]);
  const [characterData, setCharacterData] = useState({}); // 儲存字符的注音等資料
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showHints, setShowHints] = useState(true);
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

  // 語音朗讀功能
  const speakCharacter = async (char) => {
    try {
      await speakText(char, {
        lang: "zh-TW",
        rate: 0.8,
        pitch: 1.0,
      });
    } catch (error) {
      setMessage("語音播放失敗，請檢查瀏覽器設置");
      setTimeout(() => setMessage(""), 2000);
    }
  };

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
        drawingWidth: 6,
        showOutline: showOutline,
        showCharacter: false, // 練習模式下隱藏字符
        showHintAfterMisses: showHints ? 2 : false,
        highlightOnComplete: true,
        leniency: 1.2,
        markStrokeCorrectAfterMisses: 5,
        onLoadCharDataSuccess: () => {
          setLoading(false);
          setMessage(
            `字符 "${selectedCharacter}" 載入成功！點擊「開始書寫練習」開始手寫。`
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

  // 開始練習模式
  const startQuiz = () => {
    if (!writerRef.current) return;

    setIsQuizMode(true);
    setMessage("請根據筆順書寫字符。按正確的筆順，從起始點開始畫筆畫。");

    writerRef.current.quiz({
      onMistake: (strokeData) => {
        const hintText = showHints ? "提示將在2次錯誤後顯示。" : "";
        setMessage(
          `第 ${
            strokeData.strokeNum + 1
          } 筆不正確，請重試！${hintText} 錯誤次數：${
            strokeData.mistakesOnStroke
          }`
        );
      },
      onCorrectStroke: (strokeData) => {
        const remaining = strokeData.strokesRemaining;
        if (remaining > 0) {
          setMessage(
            `第 ${strokeData.strokeNum + 1} 筆正確！還剩 ${remaining} 筆。`
          );
        } else {
          setMessage(`第 ${strokeData.strokeNum + 1} 筆正確！準備完成...`);
        }
        setCurrentStroke(strokeData.strokeNum + 1);
      },
      onComplete: (summaryData) => {
        setMessage(
          `🎉 恭喜！成功完成 "${summaryData.character}" 的書寫練習！總共犯了 ${summaryData.totalMistakes} 個錯誤。`
        );
        setIsQuizMode(false);
        setCurrentStroke(0);
        // 5秒後自動隱藏完成訊息
        setTimeout(() => {
          setMessage("練習完成！可以選擇其他字符繼續練習。");
        }, 5000);
      },
      showHintAfterMisses: showHints ? 2 : false,
      highlightOnComplete: true,
      leniency: 1.2,
    });
  };

  // 重置練習
  const resetPractice = () => {
    if (writerRef.current) {
      if (isQuizMode) {
        writerRef.current.cancelQuiz();
      }
      writerRef.current.hideCharacter();
    }
    setIsQuizMode(false);
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

  // 切換提示功能
  const toggleHints = () => {
    setShowHints(!showHints);
    setMessage(!showHints ? "已啟用筆畫提示功能" : "已關閉筆畫提示功能");
    setTimeout(() => setMessage(""), 1500);
  };

  // 切換到其他字符
  const switchCharacter = (char) => {
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(""),
      charData: JSON.stringify(characterData),
      from: "practice",
    });
    router.push(`/characters/practice/writing?${params.toString()}`);
  };

  // 跳轉到動畫演示
  const goToAnimation = () => {
    const params = new URLSearchParams({
      char: selectedCharacter,
      chars: characterList.join(""),
      charData: JSON.stringify(characterData),
      from: "practice",
    });
    router.push(`/characters/practice/animation?${params.toString()}`);
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
  }, [selectedCharacter, showOutline]);

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
          <button
            onClick={backToList}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            返回字符選擇
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
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
              <h1 className="text-xl font-bold text-gray-900">書寫練習</h1>
              <p className="text-sm text-gray-500">
                正在練習：{selectedCharacter}{" "}
                {characterData[selectedCharacter] &&
                  `(${characterData[selectedCharacter]})`}
              </p>
            </div>
          </div>

          <button
            onClick={goToAnimation}
            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-full hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
          >
            觀看動畫演示
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側練習區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    {selectedCharacter}
                  </span>
                  書寫練習
                  {characterData[selectedCharacter] && (
                    <button
                      onClick={() => speakCharacter(selectedCharacter)}
                      className="ml-3 p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-all duration-200 shadow-md"
                      title="點擊發音"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892zM7 8v4l2.659 2.773A1 1 0 0110 14V6a1 1 0 01-.341.773L7 8z"
                          clipRule="evenodd"
                        />
                        <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
                        <path d="M15.536.464a.5.5 0 00-.707.707 10.5 10.5 0 010 14.858.5.5 0 00.707.707 11.5 11.5 0 000-16.272z" />
                      </svg>
                    </button>
                  )}
                </h2>

                {/* 書寫區域 */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="border-4 border-dashed border-gray-300 rounded-3xl p-6 bg-gradient-to-br from-gray-50 to-green-50">
                      <div
                        ref={containerRef}
                        className="flex justify-center items-center"
                      >
                        {loading && (
                          <div className="w-[400px] h-[400px] flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4"></div>
                            <p className="text-gray-600 font-medium">
                              載入中...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 練習模式指示器 */}
                    {isQuizMode && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        練習中
                      </div>
                    )}
                  </div>
                </div>

                {/* 訊息顯示 */}
                {message && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl">
                    <div className="flex items-start justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-green-800 font-medium text-center">
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
              <h3 className="text-lg font-bold text-gray-800 mb-4">練習控制</h3>

              <div className="space-y-3">
                <button
                  onClick={startQuiz}
                  disabled={isQuizMode || loading}
                  className="w-full py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isQuizMode ? "練習中..." : "開始書寫練習"}
                </button>

                <button
                  onClick={resetPractice}
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
                      showOutline ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showOutline ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 提示控制 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    筆畫起始提示
                  </span>
                  <button
                    onClick={toggleHints}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showHints ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showHints ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 練習進度 */}
            {isQuizMode && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  練習進度
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">當前筆畫</span>
                    <span className="font-medium">{currentStroke + 1}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          writerRef.current?._character?.strokes?.length
                            ? (currentStroke /
                                writerRef.current._character.strokes.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    完成度：
                    {writerRef.current?._character?.strokes?.length
                      ? Math.round(
                          (currentStroke /
                            writerRef.current._character.strokes.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            )}

            {/* 其他字符快速切換 */}
            {characterList.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  快速切換字符
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {characterList.map((char, index) => (
                    <div key={index} className="flex flex-col">
                      <button
                        onClick={() => switchCharacter(char)}
                        className={`aspect-square text-2xl font-bold rounded-lg transition-all duration-200 mb-2 ${
                          char === selectedCharacter
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {char}
                      </button>
                      {characterData[char] && (
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-xs text-green-600 font-medium">
                            {characterData[char]}
                          </span>
                          <button
                            onClick={() => speakCharacter(char)}
                            className="p-1 text-green-400 hover:text-green-600 rounded transition-colors"
                            title="發音"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892z"
                                clipRule="evenodd"
                              />
                              <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 使用提示 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                💡 使用提示
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 用鼠標或觸控筆按筆順書寫</p>
                <p>• 啟用提示功能會在錯誤後顯示起始點</p>
                <p>• 注意筆畫的起始位置和方向</p>
                <p>• 可調整輪廓顯示和提示設置</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
