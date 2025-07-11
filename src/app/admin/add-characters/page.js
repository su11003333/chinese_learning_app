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
  // 預設值
  const defaultValues = {
    publisher: '康軒',
    grade: '1',
    semester: '1',
    lesson: '1',
    title: '',
    characters: '',
    zhuyin: '',
    radicals: '',
    strokes: '',
    formation_words: '',
    words: ''
  };

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues
  });
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [charPreview, setCharPreview] = useState([]);
  const [isMultipleChars, setIsMultipleChars] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  // 監控輸入的字符和注音
  const inputCharacters = watch('characters', '');
  const inputZhuyin = watch('zhuyin', '');
  const inputRadicals = watch('radicals', '');
  const inputStrokes = watch('strokes', '');
  const inputFormationWords = watch('formation_words', '');
  const watchedPublisher = watch('publisher', '康軒');

  // 監控出版社變化並切換顏色主題
  useEffect(() => {
    if (watchedPublisher === '康軒') setSelectedColor('pink');
    else if (watchedPublisher === '南一') setSelectedColor('blue');
    else if (watchedPublisher === '翰林') setSelectedColor('yellow');
  }, [watchedPublisher]);

  // 每當漢字輸入變化時更新多字符標誌和預覽
  useEffect(() => {
    // 處理字符
    const chars = inputCharacters.trim().split('').filter(char => char.trim() !== '');
    // 檢測是否有多個字符
    const multiple = chars.length > 1;
    setIsMultipleChars(multiple);
    
    // 如果有多個字符，清空造句欄位
    if (multiple) {

    }
    
    // 處理注音 (使用頓號或逗點分隔)
    const zhuyins = inputZhuyin.split(/[、，,]/);
    
    // 處理部首 (使用頓號或逗點分隔)
    const radicals = inputRadicals.split(/[、，,]/);
    
    // 處理筆畫數 (使用頓號或逗點分隔)
    const strokes = inputStrokes.split(/[、，,]/);
    
    // 處理造詞 - 用分號分隔每個字符的造詞，每組內的詞用逗號分隔
    const formationWordsArray = inputFormationWords ? 
      inputFormationWords.trim().split(/[;；]/) // 支援中文和英文分號
        .filter(group => group.trim() !== '') // 過濾空組
        .map(group => 
          group.split(/[，,]/)
            .map(word => word.trim())
            .filter(word => word !== '')
        ) : [];
    
    // 除錯：顯示造詞陣列
    if (formationWordsArray.length > 0) {
      console.log('預覽 - formationWordsArray:', formationWordsArray);
      console.log('預覽 - 字符數量:', chars.length);
      formationWordsArray.forEach((words, index) => {
        console.log(`預覽 - 字符 ${index} 的造詞:`, words);
      });
    }
    
    // 建立完整的字符預覽
    const charFullPreview = chars.map((char, index) => {
      return {
        char,
        zhuyin: index < zhuyins.length ? zhuyins[index].trim() : '',
        radical: index < radicals.length ? radicals[index].trim() : '',
        stroke: index < strokes.length ? strokes[index].trim() : '',
        formationWords: index < formationWordsArray.length ? formationWordsArray[index] : []
      };
    });
    
    setCharPreview(charFullPreview);
  }, [inputCharacters, inputZhuyin, inputRadicals, inputStrokes, inputFormationWords, setValue]);

  // 顏色主題設定
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
      
      // 解析部首 (使用頓號或逗點分隔)
      const radicalsArray = data.radicals ? data.radicals.split(/[、，,]/) : [];
      
      // 解析筆畫數 (使用頓號或逗點分隔)
      const strokesArray = data.strokes ? data.strokes.split(/[、，,]/) : [];
      
      // 解析造詞 - 用分號分隔每個字符的造詞，每組內的詞用逗號分隔
      const formationWordsArray = data.formation_words ? 
        data.formation_words.trim().split(/[;；]/) // 支援中文和英文分號
          .filter(group => group.trim() !== '') // 過濾空組
          .map(group => 
            group.split(/[，,]/)
              .map(word => word.trim())
              .filter(word => word !== '')
          ) : [];
      
      // 解析詞語 (支援多種格式：每行一個詞語、逗號分隔、帶引號格式)
      const wordsArray = data.words ? 
        data.words.trim()
          // 先按行分割
          .split('\n')
          .flatMap(line => {
            // 每行再按逗號分割
            return line.split(/[,，]/);
          })
          .map(word => {
            // 移除引號和空白
            return word.trim().replace(/^["']+|["']+$/g, '');
          })
          .filter(word => word !== '') 
        : [];
      
      // 準備基本資料 - 加強數字轉換的安全性
      const publisher = data.publisher;
      const grade = parseInt(data.grade) || 1;
      const semester = parseInt(data.semester) || 1;
      const lesson = parseInt(data.lesson) || 1;
      const title = data.title ? data.title.trim() : ''; // 新增課程標題處理
      
      // 加入除錯訊息
      console.log('表單原始資料 (data):', data);
      console.log('解析後的資料:', {
        publisher,
        grade,
        semester,
        lesson,
        title
      });
      console.log('data.publisher 的值:', data.publisher);
      console.log('data.publisher 的類型:', typeof data.publisher);
      
      // 除錯造詞陣列
      console.log('提交時 - formationWordsArray:', formationWordsArray);
      console.log('提交時 - charactersArray:', charactersArray);
      console.log('提交時 - 字符數量:', charactersArray.length);
      console.log('提交時 - 造詞陣列數量:', formationWordsArray.length);
      
      // 檢查每個字符對應的造詞
      charactersArray.forEach((char, index) => {
        if (index < formationWordsArray.length) {
          console.log(`提交時 - 字符 "${char}" (索引 ${index}) 對應造詞:`, formationWordsArray[index]);
        } else {
          console.log(`提交時 - 字符 "${char}" (索引 ${index}) 沒有對應的造詞陣列`);
        }
      });
      
      // 建立課程文檔 ID
      const lessonId = `${publisher}_${grade}_${semester}_${lesson}`;
      console.log('課程 ID:', lessonId);
      
      // 準備要儲存的漢字資料
      const charactersData = charactersArray.map((char, index) => {
        const charData = {
          character: char,
          strokeCount: index < strokesArray.length && strokesArray[index].trim() !== '' ? 
            parseInt(strokesArray[index].trim()) || 0 : 0
        };
        
        // 添加對應的注音 (如果有)
        if (index < zhuyinArray.length && zhuyinArray[index].trim() !== '') {
          charData.zhuyin = zhuyinArray[index].trim();
        }
        
        // 添加對應的部首 (如果有)
        if (index < radicalsArray.length && radicalsArray[index].trim() !== '') {
          charData.radical = radicalsArray[index].trim();
        }
        
        // 添加對應的筆畫數 (如果有)
        if (index < strokesArray.length && strokesArray[index].trim() !== '') {
          charData.strokes = parseInt(strokesArray[index].trim()) || 0;
        }
        
        // 添加對應的造詞 (如果有) - 個別字符仍可以使用陣列
        if (index < formationWordsArray.length && formationWordsArray[index] && formationWordsArray[index].length > 0) {
          charData.formation_words = [...formationWordsArray[index]]; // 使用展開運算符複製陣列
          console.log(`字符 ${char} (索引 ${index}) 的造詞:`, charData.formation_words);
        } else {
          console.log(`字符 ${char} (索引 ${index}) 沒有造詞 - formationWordsArray.length: ${formationWordsArray.length}, index: ${index}`);
        }
        
        return charData;
      });
      
      // 除錯：檢查最終的字符資料
      console.log('最終的字符資料 (charactersData):', charactersData);

      
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
          

          
          // 更新文檔 - 包含課程標題和詞語
          const updateData = {
            ...existingData,
            characters: existingChars,
            updatedAt: new Date().toISOString()
          };
          
          // 如果有提供新的標題，更新標題
          if (title) {
            updateData.title = title;
          }
          
          // 如果有提供詞語，更新詞語陣列
          if (wordsArray.length > 0) {
            updateData.words = wordsArray;
          }
          
          // 如果有提供造詞，更新造詞陣列 (轉換為 Firestore 支援的格式)
          if (formationWordsArray.length > 0) {
            // 將二維陣列轉換為物件格式
            const formationWordsObject = {};
            formationWordsArray.forEach((words, index) => {
              formationWordsObject[index] = words;
            });
            updateData.formation_words = formationWordsObject;
            console.log('更新課程 - formation_words:', formationWordsObject);
          }
          
          await setDoc(lessonRef, updateData);
        } else {
          // 如果課程文檔不存在，創建新文檔
          const lessonData = {
            publisher: publisher,
            grade: grade,
            semester: semester,
            lesson: lesson,
            title: title, // 新增課程標題到資料庫
            characters: charactersData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // 如果有詞語，添加詞語陣列
          if (wordsArray.length > 0) {
            lessonData.words = wordsArray;
          }
          
          // 如果有造詞，添加造詞陣列 (轉換為 Firestore 支援的格式)
          if (formationWordsArray.length > 0) {
            // 將二維陣列轉換為物件格式
            const formationWordsObject = {};
            formationWordsArray.forEach((words, index) => {
              formationWordsObject[index] = words;
            });
            lessonData.formation_words = formationWordsObject;
            console.log('新建課程 - formation_words:', formationWordsObject);
          }
          

          
          // 創建新文檔
          await setDoc(lessonRef, lessonData);
          successChars.push(...charactersArray);
        }
        
        // 對每個新增的字，也在單字集合中新增/更新記錄 (用於快速查詢)
        for (let i = 0; i < charactersArray.length; i++) {
          const char = charactersArray[i];
          
          console.log(`處理字符 "${char}" (索引 ${i})`);
          console.log(`formationWordsArray[${i}]:`, formationWordsArray[i]);
          
          // 建立字符文檔參考
          const charRef = doc(db, "characters", char);
          const charDoc = await getDoc(charRef);
          
          // 準備單字資料
          const charData = {
            character: char,
            // 添加對應的注音 (如果有)
            ...(i < zhuyinArray.length && zhuyinArray[i].trim() !== '' ? { zhuyin: zhuyinArray[i].trim() } : {}),
            // 添加對應的部首 (如果有)
            ...(i < radicalsArray.length && radicalsArray[i].trim() !== '' ? { radical: radicalsArray[i].trim() } : {}),
            // 添加對應的筆畫數 (如果有)
            ...(i < strokesArray.length && strokesArray[i].trim() !== '' ? { strokes: parseInt(strokesArray[i].trim()) || 0 } : {}),
            // 添加對應的造詞 (如果有)
            ...(i < formationWordsArray.length && formationWordsArray[i] && formationWordsArray[i].length > 0 ? { formation_words: [...formationWordsArray[i]] } : {}),
            // 添加課程參考
            lessons: charDoc.exists() 
              ? [...new Set([...charDoc.data().lessons || [], lessonId])] // 使用 Set 去除重複
              : [lessonId],
            updatedAt: new Date().toISOString()
          };
          
          console.log(`字符 "${char}" 的最終資料:`, charData);

          
          // 添加到 characters 集合 (用文檔 ID 作為字符)
          await setDoc(charRef, charData, { merge: true });
        }
        
      } catch (error) {
        console.error(`添加課程資料時發生錯誤:`, error);
        failedChars.push(...charactersArray);
      }

      // 顯示結果訊息
      if (successChars.length > 0) {
        const titleText = title ? `「${title}」` : '';
        const wordsText = wordsArray.length > 0 ? `，同時添加了 ${wordsArray.length} 個詞語` : '';
        setSuccessMessage(`成功添加 ${successChars.length} 個字符: ${successChars.join(', ')} 到 ${publisher} ${grade}年級第${semester}學期第${lesson}課 ${titleText}${wordsText}`);
        // 重置表單
        reset(defaultValues);
        setCharPreview([]);
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
  // if (!auth || auth.loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
  //       <div className="animate-bounce p-6 bg-white rounded-full">
  //         <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"></div>
  //       </div>
  //     </div>
  //   );
  // }

  // 輸入框通用樣式
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
            {/* 教材資訊選擇 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版社
                </label>
                <select
                  {...register('publisher', { required: '請選擇出版社' })}
                  className={`${inputStyle} rounded-full font-medium`}
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
                  {...register('grade', { 
                    required: '請選擇年級',
                    valueAsNumber: true
                  })}
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
                  {...register('semester', { 
                    required: '請選擇學期',
                    valueAsNumber: true
                  })}
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
                    min: { value: 1, message: '課次必須大於或等於 1' },
                    valueAsNumber: true
                  })}
                  className={`${inputStyle} rounded-full font-medium`}
                  placeholder="例如: 12"
                  min="1"
                />
                {errors.lesson && (
                  <p className="mt-1 text-xs text-red-500">{errors.lesson.message}</p>
                )}
              </div>
            </div>

            {/* 課程標題 - 新增欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程標題 (選填)
              </label>
              <input
                type="text"
                {...register('title')}
                className={`${inputStyle} rounded-full font-medium text-lg`}
                placeholder="例如: 春天來了、我的家人"
              />
              <p className="mt-1 text-xs text-gray-500">
                為課程添加一個易於識別的標題，方便後續管理和查詢
              </p>
            </div>

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
            
            {/* 部首輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部首 (選填，多個部首請用頓號「、」或逗點「，」分隔)
              </label>
              <input
                type="text"
                {...register('radicals')}
                className={`${inputStyle} rounded-full font-medium text-lg`}
                placeholder="例如: 人、口、木"
              />
              <p className="mt-1 text-xs text-gray-500">
                每個部首將依序對應每個漢字
              </p>
            </div>
            
            {/* 筆畫數輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                筆畫數 (選填，多個筆畫數請用頓號「、」或逗點「，」分隔)
              </label>
              <input
                type="text"
                {...register('strokes')}
                className={`${inputStyle} rounded-full font-medium text-lg`}
                placeholder="例如: 5、8、12"
              />
              <p className="mt-1 text-xs text-gray-500">
                每個筆畫數將依序對應每個漢字
              </p>
            </div>
            
            {/* 造詞輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                造詞 (選填，用分號「；」或「;」分隔每個字符的造詞，每組內的詞用逗號「，」分隔)
              </label>
              <textarea
                {...register('formation_words')}
                className={`${inputStyle} rounded-2xl font-medium text-lg`}
                placeholder="例如: 雲雀,小雀；羽毛,羽翼；頭髮,長髮；處處,四處"
                rows="4"
              />
              <p className="mt-1 text-xs text-gray-500">
                ⚠️ 重要：用分號（；或;）分隔每個字符的造詞組。格式：第1個字的詞1,詞2；第2個字的詞1,詞2；第3個字的詞1,詞2
              </p>
              {inputCharacters.length > 0 && (
                <p className="mt-1 text-xs text-blue-600">
                  已輸入 {inputCharacters.length} 個漢字，需要 {inputCharacters.length} 組造詞（用分號分隔）
                </p>
              )}
            </div>
            
            {/* 漢字完整資訊預覽 */}
            {charPreview.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">漢字完整資訊預覽:</h3>
                <div className="space-y-3">
                  {charPreview.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">{item.char}</div>
                          <div className="text-xs text-gray-500">漢字</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg text-gray-700 mb-1">{item.zhuyin || '-'}</div>
                          <div className="text-xs text-gray-500">注音</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg text-gray-700 mb-1">{item.radical || '-'}</div>
                          <div className="text-xs text-gray-500">部首</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg text-gray-700 mb-1">{item.stroke || '-'}</div>
                          <div className="text-xs text-gray-500">筆畫</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-700 mb-1">
                            {item.formationWords.length > 0 ? item.formationWords.join(', ') : '-'}
                          </div>
                          <div className="text-xs text-gray-500">造詞</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 詞語輸入 - 移到最下面 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詞語 (選填，支援多種格式)
              </label>
              <textarea
                {...register('words')}
                className={`${inputStyle} rounded-2xl font-medium text-lg`}
                placeholder={`支援多種輸入格式：

1. 每行一個詞語：
井然有序
師傅
讚美

2. 逗號分隔：
師傅,讚美,口碑,準確

3. 帶引號格式：
"井然有序","師傅,讚美,口碑,準確"`}
                rows="8"
              />
              <p className="mt-1 text-xs text-gray-500">
                支援每行一個詞語、逗號分隔或帶引號格式，系統會自動解析並儲存為詞語陣列
              </p>
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
              <span>每次成功添加後，表單會重置為預設值，請重新選擇出版社、年級等設定</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>課程標題為選填欄位，建議填寫以便後續管理和查詢課程內容</span>
            </li>
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