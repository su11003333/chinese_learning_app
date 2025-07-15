'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { publishers, grades, semesters } from '@/constants/data';
import { 
  saveCharacterSearchCache, 
  loadCharacterSearchCache,
  clearCharacterSearchCache
} from '@/utils/formCache';

export default function CumulativeCharacters() {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('pink');
  const [availableLessons, setAvailableLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState([]);

  // 監控表單值變化
  const watchedPublisher = watch('publisher');
  const watchedGrade = watch('grade');
  const watchedSemester = watch('semester');
  const watchedLesson = watch('lesson');

  const colorThemes = {
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50',
      card: 'bg-white/90 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
      input: 'focus:ring-pink-400 focus:border-pink-400',
      title: 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent',
      accent: 'bg-pink-500',
      statsBg: 'bg-gradient-to-r from-pink-100 to-purple-100',
      totalText: 'text-pink-800 font-bold',
      searchBg: 'bg-pink-50 border-pink-200'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
      card: 'bg-white/90 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700',
      input: 'focus:ring-blue-400 focus:border-blue-400',
      title: 'bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent',
      accent: 'bg-blue-500',
      statsBg: 'bg-gradient-to-r from-blue-100 to-teal-100',
      totalText: 'text-blue-800 font-bold',
      searchBg: 'bg-blue-50 border-blue-200'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
      card: 'bg-white/90 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
      input: 'focus:ring-yellow-400 focus:border-yellow-400',
      title: 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent',
      accent: 'bg-yellow-500',
      statsBg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
      totalText: 'text-yellow-800 font-bold',
      searchBg: 'bg-yellow-50 border-yellow-200'
    }
  };

  const theme = colorThemes[selectedColor];

  // 初始化：載入快取
  useEffect(() => {
    const loadCachedData = () => {
      const cachedForm = loadCharacterSearchCache();
      if (cachedForm) {
        setValue('publisher', cachedForm.publisher || '康軒');
        setValue('grade', cachedForm.grade || 1);
        setValue('semester', cachedForm.semester || 1);
        setValue('lesson', cachedForm.lesson || 1);
        
        // 設置主題色彩
        const publisher = cachedForm.publisher || '康軒';
        if (publisher === '康軒') setSelectedColor('pink');
        else if (publisher === '南一') setSelectedColor('blue');
        else if (publisher === '翰林') setSelectedColor('yellow');
        
      } else {
        setValue('publisher', '康軒');
        setValue('grade', 1);
        setValue('semester', 1);
        setValue('lesson', 1);
      }
      
      loadAvailableLessons(
        cachedForm?.publisher || '康軒', 
        cachedForm?.grade || 1, 
        cachedForm?.semester || 1
      );
    };
    
    loadCachedData();
  }, [setValue]);

  // 監控表單變化並自動保存快取
  useEffect(() => {
    const formData = {
      publisher: watchedPublisher,
      grade: watchedGrade,
      semester: watchedSemester,
      lesson: watchedLesson
    };
    
    if (watchedPublisher || watchedGrade || watchedSemester || watchedLesson) {
      saveCharacterSearchCache(formData);
    }
  }, [watchedPublisher, watchedGrade, watchedSemester, watchedLesson]);

  // 載入可用課程列表
  const loadAvailableLessons = async (publisher, grade, semester) => {
    setLoadingLessons(true);
    try {
      const lessonsRef = collection(db, "lessons");
      const q = query(
        lessonsRef,
        where("publisher", "==", publisher),
        where("grade", "==", parseInt(grade)),
        where("semester", "==", parseInt(semester))
      );
      
      const querySnapshot = await getDocs(q);
      const lessons = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lessons.push({
          lesson: data.lesson,
          title: data.title || '',
          characterCount: data.characters?.length || 0,
          id: doc.id
        });
      });
      
      lessons.sort((a, b) => a.lesson - b.lesson);
      setAvailableLessons(lessons);
    } catch (error) {
      console.error('載入課程列表失敗:', error);
      setAvailableLessons([]);
    }
    setLoadingLessons(false);
  };

  // 當出版社、年級、學期改變時載入可用課程
  useEffect(() => {
    if (watchedPublisher && watchedGrade && watchedSemester) {
      loadAvailableLessons(watchedPublisher, watchedGrade, watchedSemester);
    }
  }, [watchedPublisher, watchedGrade, watchedSemester]);

  // 生成累積生字快取ID
  const generateCumulativeId = (publisher, grade, semester, lesson) => {
    return `${publisher}_${grade}_${semester}_${lesson}`.toLowerCase();
  };

  // 獲取或建立累積生字快取
  const getOrCreateCumulativeCache = async (publisher, grade, semester, lesson) => {
    const cumulativeId = generateCumulativeId(publisher, grade, semester, lesson);
    
    try {
      const cacheRef = doc(db, "cumulative_characters", cumulativeId);
      const cacheDoc = await getDoc(cacheRef);
      
      if (cacheDoc.exists()) {
        const data = cacheDoc.data();
        const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
        if (cacheAge < Infinity) {
          return {
            characters: data.characters,
            metadata: {
              totalCount: data.totalCount,
              courseRange: data.courseRange,
              fromCache: true
            }
          };
        }
      }

      console.log(`重新計算 ${publisher} ${grade}年級第${semester}學期第${lesson}課的累積生字...`);
      
      const allCharacters = new Set();
      const characterDetails = new Map(); // 存儲字符詳細信息
      const lessonsRef = collection(db, "lessons");
      
      const q = query(lessonsRef, where("publisher", "==", publisher));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const lessonData = doc.data();
        const lessonGrade = lessonData.grade;
        const lessonSemester = lessonData.semester;
        const lessonNumber = lessonData.lesson;
        
        const isInRange = (lessonGrade < grade) || 
                         (lessonGrade === grade && lessonSemester < semester) ||
                         (lessonGrade === grade && lessonSemester === semester && lessonNumber <= lesson);
        
        if (isInRange && lessonData.characters) {
          lessonData.characters.forEach(charObj => {
            if (charObj.character) {
              allCharacters.add(charObj.character);
              
              // 只記錄第一次出現的詳細信息
              if (!characterDetails.has(charObj.character)) {
                characterDetails.set(charObj.character, {
                  character: charObj.character,
                  pinyin: charObj.pinyin || '',
                  meaning: charObj.meaning || '',
                  firstAppearance: {
                    grade: lessonGrade,
                    semester: lessonSemester,
                    lesson: lessonNumber,
                    title: lessonData.title || ''
                  }
                });
              }
            }
          });
        }
      });

      const charactersArray = Array.from(allCharacters).map(char => 
        characterDetails.get(char) || { character: char }
      );
      
      // 按首次出現順序排序
      charactersArray.sort((a, b) => {
        const aFirst = a.firstAppearance;
        const bFirst = b.firstAppearance;
        if (!aFirst || !bFirst) return 0;
        
        if (aFirst.grade !== bFirst.grade) return aFirst.grade - bFirst.grade;
        if (aFirst.semester !== bFirst.semester) return aFirst.semester - bFirst.semester;
        return aFirst.lesson - bFirst.lesson;
      });
      
      const metadata = {
        totalCount: charactersArray.length,
        courseRange: `1年級上學期第1課 ~ ${grade}年級第${semester}學期第${lesson}課`,
        fromCache: false
      };
      
      await setDoc(cacheRef, {
        publisher,
        grade,
        semester,
        lesson,
        characters: charactersArray,
        lastUpdated: new Date().toISOString(),
        totalCount: charactersArray.length,
        courseRange: metadata.courseRange,
        version: 1
      });
      
      return { characters: charactersArray, metadata };
      
    } catch (error) {
      console.error('獲取累積生字快取失敗:', error);
      throw error;
    }
  };

  // 字符搜索過濾
  useEffect(() => {
    
    if (!searchTerm.trim()) {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(charData => {
        // 處理字串和物件兩種格式
        if (typeof charData === 'string') {
          return charData.includes(searchTerm);
        } else if (typeof charData === 'object') {
          return charData?.character?.includes(searchTerm) ||
                 (charData?.pinyin && charData.pinyin.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 (charData?.meaning && charData.meaning.includes(searchTerm));
        }
        return false;
      });
      setFilteredCharacters(filtered);
    }
  }, [searchTerm, characters]);

  // 主查詢函數
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const { publisher, grade, semester, lesson } = data;
      const endGrade = parseInt(grade);
      const endSemester = parseInt(semester);
      const endLesson = parseInt(lesson);

      const result = await getOrCreateCumulativeCache(publisher, endGrade, endSemester, endLesson);

      
      setCharacters(result.characters || []);
      setFilteredCharacters(result.characters || []);

      // 根據出版社變更顏色主題
      if (publisher === '康軒') setSelectedColor('pink');
      else if (publisher === '南一') setSelectedColor('blue');
      else if (publisher === '翰林') setSelectedColor('yellow');
      
      setTimeout(() => {
        const resultElement = document.getElementById('character-results');
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 300);
      
    } catch (error) {
      console.error("查詢錯誤:", error);
      alert('查詢發生錯誤，請稍後再試');
    }
    
    setLoading(false);
  };

  // 重新查詢函數
  const handleResetSearch = () => {
    setCharacters([]);
    setFilteredCharacters([]);
    setSearchTerm('');
    
    setTimeout(() => {
      const formElement = document.getElementById('search-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    }, 100);
  };

  // 清除所有快取
  const clearAllCache = () => {
    if (confirm('確定要清除所有表單快取嗎？')) {
      clearCharacterSearchCache();
      reset({
        publisher: '康軒',
        grade: 1,
        semester: 1,
        lesson: 1
      });
      setSelectedColor('pink');
      setCharacters([]);
      setFilteredCharacters([]);
      setSearchTerm('');
      alert('快取已清除');
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${theme.bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold text-center ${theme.title}`}>
            累積漢字表
          </h1>
        </div>
        
        <div id="search-form" className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 第一行：出版社、年級、學期 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版社
                </label>
                <select
                  {...register('publisher', { required: '請選擇出版社' })}
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                  onChange={(e) => {
                    const publisher = e.target.value;
                    if (publisher === '康軒') setSelectedColor('pink');
                    else if (publisher === '南一') setSelectedColor('blue');
                    else if (publisher === '翰林') setSelectedColor('yellow');
                  }}
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
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
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
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>第{semester}學期</option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-xs text-red-500">{errors.semester.message}</p>
                )}
              </div>
            </div>

            {/* 第二行：課次 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課次（包含此課前的所有漢字）
                {loadingLessons && (
                  <span className="ml-2 text-xs text-gray-500">載入中...</span>
                )}
              </label>
              <select
                {...register('lesson', { required: '請選擇課次' })}
                className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                disabled={loadingLessons || availableLessons.length === 0}
              >
                <option value="">請選擇課次</option>
                {availableLessons.map(lessonInfo => (
                  <option key={lessonInfo.lesson} value={lessonInfo.lesson}>
                    第{lessonInfo.lesson}課{lessonInfo.title ? ` - ${lessonInfo.title}` : ''}
                  </option>
                ))}
              </select>
              {errors.lesson && (
                <p className="mt-1 text-xs text-red-500">{errors.lesson.message}</p>
              )}
              {availableLessons.length === 0 && !loadingLessons && (
                <p className="mt-1 text-xs text-gray-500">此年級學期暫無課程資料</p>
              )}
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 ${theme.button} text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition disabled:opacity-70`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    查詢中...
                  </div>
                ) : '查詢累積漢字表'}
              </button>
              
              <button
                type="button"
                onClick={clearAllCache}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-full transition"
              >
                清除快取
              </button>
            </div>
          </form>
        </div>
        
        {/* 查詢結果 */}
        {characters.length > 0 && (
          <div id="character-results" className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">累積漢字表</h2>
              
              {/* 統計信息和複製按鈕 */}
              <div className={`${theme.statsBg} rounded-xl p-6 mb-6 border-2 border-white shadow-lg`}>
                <div className="flex flex-wrap justify-center items-center gap-6 text-lg">
                  <div className="flex items-center bg-white/80 rounded-full px-4 py-2 shadow-sm">
                    <div className={`w-4 h-4 ${theme.accent} rounded-full mr-3 shadow-sm`}></div>
                    <span className={`${theme.totalText} text-lg`}>總計：{characters.length} 個漢字</span>
                  </div>
                  {filteredCharacters.length !== characters.length && (
                    <div className="flex items-center bg-white/80 rounded-full px-4 py-2 shadow-sm">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 shadow-sm"></div>
                      <span className="font-bold text-blue-800 text-lg">搜索結果：{filteredCharacters.length} 個</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const allCharacters = filteredCharacters.map(charData => 
                        typeof charData === 'string' ? charData : charData?.character
                      ).join('');
                      navigator.clipboard.writeText(allCharacters).then(() => {
                        alert(`已複製 ${filteredCharacters.length} 個漢字到剪貼板！`);
                      }).catch(err => {
                        console.error('複製失敗:', err);
                        alert('複製失敗，請手動選取文字複製');
                      });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 ${theme.button} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    一鍵複製
                  </button>
                </div>
              </div>

              {/* 搜索框 */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="搜索漢字、拼音或意思..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 ${theme.searchBg} ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-lg shadow-sm`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* 漢字顯示區 */}
            {filteredCharacters && filteredCharacters.length > 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="text-xl font-bold mb-4 text-gray-800 text-center border-b border-gray-200 pb-3">
                  漢字列表
                </div>
                <div className="leading-relaxed text-center break-all select-all" style={{ fontSize: '20px', lineHeight: '1.8' }}>
                  {filteredCharacters.map((charData, index) => {
                    const character = typeof charData === 'string' ? charData : charData?.character;
                    return (
                      <span 
                        key={`char-${index}-${character || 'unknown'}`} 
                        className="inline-block mx-1 my-1 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded px-1 transition-colors cursor-pointer"
                        title={typeof charData === 'object' ? `${character}${charData?.pinyin ? ` (${charData.pinyin})` : ''}${charData?.meaning ? ` - ${charData.meaning}` : ''}` : character}
                      >
                        {character || '?'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  {characters.length > 0 ? '搜索中無符合的字符...' : '請先選擇條件並查詢'}
                </div>
              </div>
            )}
            
            {filteredCharacters.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-6 text-lg">🔍 沒有找到符合「<span className="font-bold text-gray-800">{searchTerm}</span>」的漢字</div>
                <button
                  onClick={() => setSearchTerm('')}
                  className={`px-6 py-3 ${theme.button} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  清除搜索
                </button>
              </div>
            )}
            
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={handleResetSearch}
                className={`px-8 py-3 ${theme.button} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              >
                🔄 重新查詢
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}