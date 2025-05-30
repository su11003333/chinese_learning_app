// src/app/characters/practice/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CharacterPractice() {
  const [inputText, setInputText] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [currentMode, setCurrentMode] = useState('input'); // 'input', 'list'
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 從輸入文字提取漢字
  const extractCharacters = (text) => {
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    return chineseChars ? [...new Set(chineseChars)] : [];
  };

  // 處理輸入提交
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

  // 跳轉到動畫演示頁面
  const goToAnimation = (char) => {
    // 使用 URL 參數傳遞字符和字符列表
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(''),
      from: 'practice'
    });
    router.push(`/characters/practice/animation?${params.toString()}`);
  };

  // 跳轉到寫字練習頁面
  const goToWriting = (char) => {
    // 使用 URL 參數傳遞字符和字符列表
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(''),
      from: 'practice'
    });
    router.push(`/characters/practice/writing?${params.toString()}`);
  };

  // 返回輸入頁面
  const backToInput = () => {
    setCurrentMode('input');
    setCharacterList([]);
    setInputText('');
    setMessage('');
  };

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
              輸入您想要練習的中文文字，選擇動畫演示或書寫練習
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characterList.map((char, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-3xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-800 mb-4">
                    {char}
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => goToAnimation(char)}
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      動畫演示
                    </button>
                    
                    <button
                      onClick={() => goToWriting(char)}
                      className="w-full py-2 px-4 bg-gradient-to-r from-green-400 to-green-500 text-white font-medium rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" clipRule="evenodd" />
                      </svg>
                      書寫練習
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              點擊「動畫演示」觀看筆順，點擊「書寫練習」開始手寫練習
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentMode === 'input' && renderInputMode()}
      {currentMode === 'list' && renderListMode()}
    </>
  );
}