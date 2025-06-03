// src/app/characters/practice/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBatchZhuyin, speakText } from '@/utils/pronunciationService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { publishers, grades, semesters } from '@/constants/data';

export default function CharacterPractice() {
  const [inputText, setInputText] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [characterData, setCharacterData] = useState({}); // 儲存字符的注音等資料
  const [currentMode, setCurrentMode] = useState('input'); // 'input', 'list'
  const [message, setMessage] = useState('');
  const [isLoadingPronunciation, setIsLoadingPronunciation] = useState({});
  const [selectedColor, setSelectedColor] = useState('pink');
  
  // 快速選擇相關狀態
  const [quickSelectForm, setQuickSelectForm] = useState({
    publisher: '康軒',
    grade: 1,
    semester: 1,
    lesson: 1
  });
  const [availableLessons, setAvailableLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  
  const router = useRouter();

  // 顏色主題設定
  const colorThemes = {
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-purple-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
      input: 'focus:ring-pink-300',
      title: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
      border: 'border-pink-200',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-green-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500',
      input: 'focus:ring-blue-300',
      title: 'bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent',
      border: 'border-blue-200',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
      input: 'focus:ring-yellow-300',
      title: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent',
      border: 'border-yellow-200',
    }
  };

  const theme = colorThemes[selectedColor];

  // 根據出版社變更主題色彩
  const handlePublisherChange = (publisher) => {
    setQuickSelectForm(prev => ({ ...prev, publisher }));
    if (publisher === '康軒') setSelectedColor('pink');
    else if (publisher === '南一') setSelectedColor('blue');
    else if (publisher === '翰林') setSelectedColor('yellow');
  };

  // 載入可用課程列表
  const loadAvailableLessons = async (publisher, grade, semester) => {
    setIsLoadingLessons(true);
    try {
      const lessonsRef = collection(db, "lessons");
      const q = query(
        lessonsRef,
        where("publisher", "==", publisher),
        where("grade", "==", grade),
        where("semester", "==", semester)
      );
      
      const querySnapshot = await getDocs(q);
      const lessons = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lessons.push({
          lesson: data.lesson,
          characterCount: data.characters?.length || 0,
          id: doc.id
        });
      });
      
      // 按課次排序
      lessons.sort((a, b) => a.lesson - b.lesson);
      setAvailableLessons(lessons);
    } catch (error) {
      console.error('載入課程列表失敗:', error);
      setAvailableLessons([]);
    }
    setIsLoadingLessons(false);
  };

  // 載入指定課程的所有字符
  const loadLessonCharacters = async (publisher, grade, semester, lesson) => {
    setIsLoadingCharacters(true);
    setMessage('正在載入課程字符...');
    
    try {
      // 建立課程 ID
      const lessonId = `${publisher}_${grade}_${semester}_${lesson}`;
      
      // 從 lessons collection 獲取課程資料
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);
      
      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        const characters = lessonData.characters || [];
        
        if (characters.length > 0) {
          // 提取字符列表
          const charList = characters.map(charObj => charObj.character);
          
          // 建立字符資料對象（包含注音）
          const charData = {};
          characters.forEach(charObj => {
            charData[charObj.character] = charObj.zhuyin || '';
          });
          
          // 對於沒有注音的字符，嘗試從 pinyin-pro 獲取
          const missingZhuyinChars = charList.filter(char => !charData[char]);
          if (missingZhuyinChars.length > 0) {
            setMessage('正在載入注音資料...');
            try {
              const additionalZhuyin = await getBatchZhuyin(missingZhuyinChars);
              Object.assign(charData, additionalZhuyin);
            } catch (error) {
              console.warn('獲取額外注音失敗:', error);
            }
          }
          
          setCharacterList(charList);
          setCharacterData(charData);
          setCurrentMode('list');
          setMessage(`成功載入 ${publisher} ${grade}年級第${semester}學期第${lesson}課，共 ${charList.length} 個字符`);
        } else {
          setMessage('該課程沒有找到字符資料');
        }
      } else {
        setMessage('找不到指定的課程資料');
      }
    } catch (error) {
      console.error('載入課程字符失敗:', error);
      setMessage('載入課程字符失敗，請稍後再試');
    }
    
    setIsLoadingCharacters(false);
  };

  // 從輸入文字提取漢字
  const extractCharacters = (text) => {
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    return chineseChars ? [...new Set(chineseChars)] : [];
  };

  // 語音朗讀功能
  const speakCharacter = async (char) => {
    try {
      await speakText(char, {
        lang: 'zh-TW',
        rate: 0.8,
        pitch: 1.0
      });
    } catch (error) {
      setMessage('語音播放失敗，請檢查瀏覽器設置');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // 處理輸入提交
  const handleInputSubmit = async () => {
    const chars = extractCharacters(inputText);
    if (chars.length === 0) {
      setMessage('請輸入包含中文字符的文字！');
      return;
    }
    
    setMessage('正在載入注音資料...');
    
    try {
      // 使用 pinyin-pro 獲取注音
      const charData = await getBatchZhuyin(chars);
      
      setCharacterList(chars);
      setCharacterData(charData);
      setCurrentMode('list');
      setMessage('');
    } catch (error) {
      console.error('獲取注音失敗:', error);
      setMessage('獲取注音失敗，請稍後再試');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 跳轉到動畫演示頁面
  const goToAnimation = (char) => {
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(''),
      charData: JSON.stringify(characterData),
      from: 'practice'
    });
    router.push(`/characters/practice/animation?${params.toString()}`);
  };

  // 跳轉到寫字練習頁面
  const goToWriting = (char) => {
    const params = new URLSearchParams({
      char: char,
      chars: characterList.join(''),
      charData: JSON.stringify(characterData),
      from: 'practice'
    });
    router.push(`/characters/practice/writing?${params.toString()}`);
  };

  // 返回輸入頁面
  const backToInput = () => {
    setCurrentMode('input');
    setCharacterList([]);
    setCharacterData({});
    setInputText('');
    setMessage('');
    setIsLoadingPronunciation({});
    setAvailableLessons([]);
  };

  // 渲染輸入界面（兩欄佈局）
  const renderInputMode = () => (
    <div className={`min-h-screen ${theme.bg} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 ${theme.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${theme.title}`}>
            漢字筆順練習
          </h1>
          <p className="text-gray-600 text-lg">
            選擇練習方式：輸入自訂文字或快速選擇課程
          </p>
        </div>

        {/* 兩欄佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 左欄：自由輸入文字 */}
          <div className={`${theme.card} rounded-3xl shadow-xl p-6`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${theme.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">自由輸入文字</h2>
              <p className="text-gray-600">輸入任何中文文字，系統會自動提取漢字</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  輸入中文文字
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-2xl ${theme.input} focus:ring-2 focus:border-transparent resize-none transition-all duration-200`}
                  rows="6"
                  placeholder="例如：我愛學習中文，每天都要練習寫字。&#10;&#10;輸入任何包含中文字的句子或文章，系統會自動提取出所有不重複的漢字供您練習。"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {inputText.trim() ? (
                    <>
                      已輸入 {inputText.length} 個字符
                      {extractCharacters(inputText).length > 0 && (
                        <span className="ml-2 text-green-600">
                          · 包含 {extractCharacters(inputText).length} 個不重複漢字
                        </span>
                      )}
                    </>
                  ) : '請輸入包含中文字符的文字'}
                </p>
              </div>
              
              <button
                onClick={handleInputSubmit}
                disabled={!inputText.trim() || extractCharacters(inputText).length === 0}
                className={`w-full py-3 px-6 ${theme.button} text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
              >
                提取漢字開始練習
              </button>

              {/* 預覽提取的字符 */}
              {inputText.trim() && extractCharacters(inputText).length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">預覽提取的漢字：</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractCharacters(inputText).slice(0, 10).map((char, index) => (
                      <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-lg font-medium">
                        {char}
                      </span>
                    ))}
                    {extractCharacters(inputText).length > 10 && (
                      <span className="px-2 py-1 bg-gray-200 rounded-lg text-sm text-gray-600">
                        +{extractCharacters(inputText).length - 10}個
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右欄：快速選擇課程 */}
          <div className={`${theme.card} rounded-3xl shadow-xl p-6`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${theme.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">快速選擇課程</h2>
              <p className="text-gray-600">選擇教材版本和課程，快速載入所有字符</p>
            </div>

            {/* 快速選擇表單 */}
            <div className="space-y-4">
              {/* 版本選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出版社</label>
                <select
                  value={quickSelectForm.publisher}
                  onChange={(e) => {
                    handlePublisherChange(e.target.value);
                    loadAvailableLessons(e.target.value, quickSelectForm.grade, quickSelectForm.semester);
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                >
                  {publishers.map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
                  ))}
                </select>
              </div>

              {/* 年級和學期 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年級</label>
                  <select
                    value={quickSelectForm.grade}
                    onChange={(e) => {
                      const grade = parseInt(e.target.value);
                      setQuickSelectForm(prev => ({ ...prev, grade }));
                      loadAvailableLessons(quickSelectForm.publisher, grade, quickSelectForm.semester);
                    }}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                  >
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}年級</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">學期</label>
                  <select
                    value={quickSelectForm.semester}
                    onChange={(e) => {
                      const semester = parseInt(e.target.value);
                      setQuickSelectForm(prev => ({ ...prev, semester }));
                      loadAvailableLessons(quickSelectForm.publisher, quickSelectForm.grade, semester);
                    }}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>第{semester}學期</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 課次輸入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">課次</label>
                <input
                  type="number"
                  value={quickSelectForm.lesson}
                  onChange={(e) => setQuickSelectForm(prev => ({ ...prev, lesson: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                  min="1"
                  placeholder="請輸入課次"
                />
              </div>

              {/* 載入按鈕 */}
              <button
                onClick={() => loadLessonCharacters(
                  quickSelectForm.publisher,
                  quickSelectForm.grade,
                  quickSelectForm.semester,
                  quickSelectForm.lesson
                )}
                disabled={isLoadingCharacters}
                className={`w-full py-3 px-6 ${theme.button} text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
              >
                {isLoadingCharacters ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    載入中...
                  </div>
                ) : `載入第${quickSelectForm.lesson}課`}
              </button>

              {/* 可用課程列表 */}
              {availableLessons.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    可用課程
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableLessons.map((lessonInfo) => (
                      <button
                        key={lessonInfo.lesson}
                        onClick={() => {
                          setQuickSelectForm(prev => ({ ...prev, lesson: lessonInfo.lesson }));
                          loadLessonCharacters(
                            quickSelectForm.publisher,
                            quickSelectForm.grade,
                            quickSelectForm.semester,
                            lessonInfo.lesson
                          );
                        }}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 text-sm ${
                          quickSelectForm.lesson === lessonInfo.lesson
                            ? `${theme.button.replace('hover:', '')} text-white border-transparent`
                            : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold">第{lessonInfo.lesson}課</div>
                        <div className="text-xs opacity-75">{lessonInfo.characterCount}字</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoadingLessons && (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-4 border-gray-200 rounded-full border-t-pink-500 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">載入課程中...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部訊息顯示 */}
        {message && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className={`p-4 rounded-2xl border-2 ${
              message.includes('成功') ? 'bg-green-50 border-green-200' :
              message.includes('失敗') || message.includes('錯誤') ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${
                  message.includes('成功') ? 'text-green-600' :
                  message.includes('失敗') || message.includes('錯誤') ? 'text-red-600' :
                  'text-blue-600'
                }`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium text-center ${
                  message.includes('成功') ? 'text-green-800' :
                  message.includes('失敗') || message.includes('錯誤') ? 'text-red-800' :
                  'text-blue-800'
                }`}>{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染字符列表
  const renderListMode = () => (
    <div className={`min-h-screen ${theme.bg} p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme.card} rounded-3xl shadow-2xl p-8`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.title}`}>選擇要練習的漢字</h2>
              <p className="text-gray-600 mt-1">
                共找到 {characterList.length} 個不同的漢字
              </p>
            </div>
            <button
              onClick={backToInput}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              ← 重新選擇
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characterList.map((char, index) => (
              <div
                key={index}
                className={`${theme.bg} border-2 ${theme.border} rounded-3xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {char}
                  </div>
                  
                  {/* 注音顯示 */}
                  <div className="mb-4 h-8 flex items-center justify-center">
                    {characterData[char] ? (
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-medium ${
                          selectedColor === 'pink' ? 'text-pink-600' : 
                          selectedColor === 'blue' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {characterData[char]}
                        </span>
                        <button
                          onClick={() => speakCharacter(char)}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            selectedColor === 'pink' ? 'text-pink-500 hover:text-pink-700 hover:bg-pink-100' : 
                            selectedColor === 'blue' ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-100' : 
                            'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100'
                          }`}
                          title="點擊發音"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.721 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.721l3.662-3.816a1 1 0 011 .892zM7 8v4l2.659 2.773A1 1 0 0110 14V6a1 1 0 01-.341.773L7 8z" clipRule="evenodd" />
                            <path d="M13.364 2.636a.5.5 0 00-.708.708 6.5 6.5 0 010 9.192.5.5 0 00.708.708 7.5 7.5 0 000-10.608z" />
                            <path d="M15.536.464a.5.5 0 00-.707.707 10.5 10.5 0 010 14.858.5.5 0 00.707.707 11.5 11.5 0 000-16.272z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">載入中...</span>
                    )}
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