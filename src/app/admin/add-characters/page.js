// src/app/admin/add-characters/page.js
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {publishers, grades, semesters} from '@/constants/data';

export default function AddCharacters() {
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [zhuyinPreview, setZhuyinPreview] = useState([]);
  const [isMultipleChars, setIsMultipleChars] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  // 監控輸入的字符和注音
  const inputCharacters = watch('characters', '');
  const inputZhuyin = watch('zhuyin', '');

  // 每當漢字輸入變化時更新多字符標誌和預覽
  useEffect(() => {
    // 處理字符
    const chars = inputCharacters.trim().split('').filter(char => char.trim() !== '');
    // 檢測是否有多個字符
    const multiple = chars.length > 1;
    setIsMultipleChars(multiple);
    
    // 如果有多個字符，清空造句欄位
    if (multiple) {
      setValue('examples', '');
    }
    
    // 處理注音 (使用頓號或逗點分隔)
    const zhuyins = inputZhuyin.split(/[、，,]/);
    
    // 建立漢字-注音配對預覽
    const preview = chars.map((char, index) => {
      return {
        char,
        zhuyin: index < zhuyins.length ? zhuyins[index].trim() : ''
      };
    });
    
    setZhuyinPreview(preview);
  }, [inputCharacters, inputZhuyin, setValue]);

  // 顏色主題設定 (與您的範例保持一致)
  const colorThemes = {
    pink: {
      bg: 'bg-gradient-to-r from-pink-100 to-purple-100',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
      input: 'focus:ring-pink-300',
      title: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-100 to-green-100',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500',
      input: 'focus:ring-blue-300',
      title: 'bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent',
    },
    yellow: {
      bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
      input: 'focus:ring-yellow-300',
      title: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent',
    }
  };

  const theme = colorThemes[selectedColor];

  // 預設值


  // 根據出版社切換顏色主題
  const handlePublisherChange = (e) => {
    const publisher = e.target.value;
    if (publisher === '康軒') setSelectedColor('pink');
    else if (publisher === '南一') setSelectedColor('blue');
    else if (publisher === '翰林') setSelectedColor('yellow');
  };

  // 處理表單提交
  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // 字串轉為字符陣列 (去除空白)
      const charactersArray = data.characters.trim().split('').filter(char => char.trim() !== '');
      
      // 檢查是否有字符
      if (charactersArray.length === 0) {
        setErrorMessage('請輸入至少一個字符');
        setLoading(false);
        return;
      }

      // 解析注音 (使用頓號或逗點分隔)
      const zhuyinArray = data.zhuyin ? data.zhuyin.split(/[、，,]/) : [];
      
      // 準備基本資料
      const publisher = data.publisher;
      const grade = parseInt(data.grade);
      const semester = parseInt(data.semester);
      const lesson = parseInt(data.lesson);
      
      // 建立課程文檔 ID
      const lessonId = `${publisher}_${grade}_${semester}_${lesson}`;
      
      // 準備要儲存的漢字資料
      const charactersData = charactersArray.map((char, index) => {
        const charData = {
          character: char,
          strokeCount: 0 // 預設值，可以後續更新
        };
        
        // 添加對應的注音 (如果有)
        if (index < zhuyinArray.length && zhuyinArray[index].trim() !== '') {
          charData.zhuyin = zhuyinArray[index].trim();
        }
        
        return charData;
      });
      
      // 如果只有一個字符，且有例句
      let examples = [];
      if (charactersArray.length === 1 && data.examples && data.examples.trim() !== '') {
        examples = data.examples.split('\n').filter(ex => ex.trim() !== '');
      }
      
      // 存儲成功的字符和失敗的字符
      const successChars = [];
      const failedChars = [];
      
      try {
        // 檢查課程文檔是否已存在
        const lessonRef = doc(db, "lessons", lessonId);
        const lessonDoc = await getDoc(lessonRef);
        
        if (lessonDoc.exists()) {
          // 如果課程文檔已存在，更新現有資料
          const existingData = lessonDoc.data();
          const existingChars = existingData.characters || [];
          
          // 遍歷新字符，檢查是否已存在
          for (const charData of charactersData) {
            const existingIndex = existingChars.findIndex(c => c.character === charData.character);
            
            if (existingIndex >= 0) {
              // 如果字符已存在，更新它
              existingChars[existingIndex] = {
                ...existingChars[existingIndex],
                ...charData
              };
              successChars.push(charData.character);
            } else {
              // 如果字符不存在，添加它
              existingChars.push(charData);
              successChars.push(charData.character);
            }
          }
          
          // 如果有例句且只有一個字符，更新例句
          if (charactersArray.length === 1 && examples.length > 0) {
            // 找到字符的索引
            const charIndex = existingChars.findIndex(c => c.character === charactersArray[0]);
            if (charIndex >= 0) {
              existingChars[charIndex].examples = examples;
            }
          }
          
          // 更新文檔
          await setDoc(lessonRef, {
            ...existingData,
            characters: existingChars,
            updatedAt: new Date().toISOString()
          });
        } else {
          // 如果課程文檔不存在，創建新文檔
          const lessonData = {
            publisher: publisher,
            grade: grade,
            semester: semester,
            lesson: lesson,
            characters: charactersData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // 如果有例句且只有一個字符，添加例句
          if (charactersArray.length === 1 && examples.length > 0) {
            lessonData.characters[0].examples = examples;
          }
          
          // 創建新文檔
          await setDoc(lessonRef, lessonData);
          successChars.push(...charactersArray);
        }
        
        // 對每個新增的字，也在單字集合中新增/更新記錄 (用於快速查詢)
        for (let i = 0; i < charactersArray.length; i++) {
          const char = charactersArray[i];
          
          // 建立字符文檔參考
          const charRef = doc(db, "characters", char);
          const charDoc = await getDoc(charRef);
          
          // 準備單字資料
          const charData = {
            character: char,
            // 添加對應的注音 (如果有)
            ...(i < zhuyinArray.length && zhuyinArray[i].trim() !== '' ? { zhuyin: zhuyinArray[i].trim() } : {}),
            // 添加課程參考
            lessons: charDoc.exists() 
              ? [...new Set([...charDoc.data().lessons || [], lessonId])] // 使用 Set 去除重複
              : [lessonId],
            updatedAt: new Date().toISOString()
          };
          
          // 添加例句（如果有且是單一字符）
          if (charactersArray.length === 1 && examples.length > 0) {
            charData.examples = examples;
          }
          
          // 添加到 characters 集合 (用文檔 ID 作為字符)
          await setDoc(charRef, charData, { merge: true });
        }
        
      } catch (error) {
        console.error(`添加課程資料時發生錯誤:`, error);
        failedChars.push(...charactersArray);
      }

      // 顯示結果訊息
      if (successChars.length > 0) {
        setSuccessMessage(`成功添加 ${successChars.length} 個字符: ${successChars.join(', ')} 到 ${publisher} ${grade}年級第${semester}學期第${lesson}課`);
        // 重置表單
        reset();
        setZhuyinPreview([]);
        setIsMultipleChars(false);
      }
      
      if (failedChars.length > 0) {
        setErrorMessage(`${failedChars.length} 個字符添加失敗: ${failedChars.join(', ')}`);
      }
    } catch (error) {
      console.error('添加單字時發生錯誤:', error);
      setErrorMessage(`發生錯誤: ${error.message}`);
    }
    
    setLoading(false);
  };

  // 顯示加載中或未授權
  if (!auth || auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="animate-bounce p-6 bg-white rounded-full">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  // 輸入框通用樣式 - 增強文字顏色對比度
  const inputStyle = `w-full px-4 py-3 text-gray-800 placeholder-gray-500 border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`;

  return (
    <div className={`min-h-screen py-12 px-4 ${theme.bg}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme.title}`}>
          添加漢字
        </h1>
        
        {/* 主卡片 */}
        <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 輸入字符區域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                輸入漢字 (單個或多個)
              </label>
              <textarea
                {...register('characters', { 
                  required: '請輸入至少一個漢字',
                })}
                className={`${inputStyle} rounded-2xl font-medium text-lg`} 
                placeholder="請輸入漢字，可一次輸入多個"
                rows="3"
              />
              {errors.characters && (
                <p className="mt-1 text-xs text-red-500">{errors.characters.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                已輸入 {inputCharacters.trim().length} 個字符
                {isMultipleChars && <span className="ml-1 text-amber-600">（多字符模式：已停用造句功能）</span>}
              </p>
            </div>

            {/* 注音輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                注音 (選填，多個注音請用頓號「、」或逗點「，」分隔)
              </label>
              <input
                type="text"
                {...register('zhuyin')}
                className={`${inputStyle} rounded-full font-medium text-lg`}
                placeholder="例如: ㄊㄧㄥ、ㄩㄥˋ"
              />
              <p className="mt-1 text-xs text-gray-500">
                每個注音將依序對應每個漢字
              </p>
            </div>
            
            {/* 漢字-注音對應預覽 */}
            {zhuyinPreview.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">漢字-注音對應預覽:</h3>
                <div className="flex flex-wrap gap-2">
                  {zhuyinPreview.map((item, index) => (
                    <div key={index} className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
                      <div className="text-xl font-bold text-gray-800">{item.char}</div>
                      {item.zhuyin && (
                        <div className="text-sm text-gray-600 text-center">{item.zhuyin}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 教材資訊選擇 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版社
                </label>
                <select
                  {...register('publisher', { required: '請選擇出版社' })}
                  className={`${inputStyle} rounded-full font-medium`}
                  onChange={handlePublisherChange}
                >
                  {publishers.map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
                  ))}
                </select>
                {errors.publisher && (
                  <p className="mt-1 text-xs text-red-500">{errors.publisher.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年級
                </label>
                <select
                  {...register('grade', { required: '請選擇年級' })}
                  className={`${inputStyle} rounded-full font-medium`}
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}年級</option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="mt-1 text-xs text-red-500">{errors.grade.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  學期
                </label>
                <select
                  {...register('semester', { required: '請選擇學期' })}
                  className={`${inputStyle} rounded-full font-medium`}
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>第{semester}學期</option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-xs text-red-500">{errors.semester.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  課次
                </label>
                <input
                  type="number"
                  {...register('lesson', { 
                    required: '請輸入課次',
                    min: { value: 1, message: '課次必須大於或等於 1' }
                  })}
                  className={`${inputStyle} rounded-full font-medium`}
                  placeholder="例如: 1"
                  min="1"
                />
                {errors.lesson && (
                  <p className="mt-1 text-xs text-red-500">{errors.lesson.message}</p>
                )}
              </div>
            </div>
            
            {/* 例句 - 根據字符數量啟用/停用 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  例句 (選填，每行一句)
                </label>
                {isMultipleChars && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                    多字符模式已停用
                  </span>
                )}
              </div>
              <textarea
                {...register('examples')}
                className={`${inputStyle} rounded-2xl font-medium ${isMultipleChars ? 'bg-gray-100 opacity-60' : ''}`}
                placeholder={isMultipleChars ? "多字符模式無法輸入例句" : "請輸入例句，每行一句"}
                rows="3"
                disabled={isMultipleChars}
              />
              {isMultipleChars && (
                <p className="mt-1 text-xs text-amber-600">
                  多字符模式下無法輸入例句。如需添加例句，請僅輸入一個漢字。
                </p>
              )}
            </div>
            
            {/* 成功/錯誤訊息 */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 font-medium px-4 py-3 rounded-xl">
                <p>{successMessage}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-xl">
                <p>{errorMessage}</p>
              </div>
            )}
            
            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 ${theme.button} text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition disabled:opacity-70`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  處理中...
                </div>
              ) : '添加到資料庫'}
            </button>
          </form>
        </div>
        
        {/* 說明卡片 */}
        <div className={`${theme.card} rounded-3xl shadow-md p-6`}>
          <h2 className="text-xl font-bold mb-3 text-gray-800">使用說明</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>可以一次輸入一個或多個漢字，漢字會依據課程分組儲存</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>注音可以使用頓號(、)或逗點(，)來分隔，每個注音將依序對應每個漢字</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>例句功能僅在輸入單一漢字時可用，多字符模式下將自動停用</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>輸入後，您可以在預覽區看到漢字和注音的對應關係</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>漢字會同時儲存在課程集合與單字集合中，便於快速查詢</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}