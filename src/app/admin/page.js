// src/app/admin/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth() || {};
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' 或 'manage'

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }

    // 只有當activeTab為'manage'時才獲取字符列表
    if (activeTab === 'manage') {
      fetchCharacters();
    }
  }, [user, isAdmin, loading, router, activeTab]);

  const fetchCharacters = async () => {
    setIsLoading(true);
    try {
      const charactersRef = collection(db, 'characters');
      const q = query(charactersRef, orderBy('grade'), orderBy('semester'), orderBy('lesson'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const fetchedCharacters = [];
      querySnapshot.forEach((doc) => {
        fetchedCharacters.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCharacters(fetchedCharacters);
    } catch (error) {
      console.error('獲取單字錯誤:', error);
    }
    setIsLoading(false);
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      const characterData = {
        character: data.character,
        zhuyin: data.zhuyin,
        meaning: data.meaning || '',
        publisher: data.publisher,
        grade: parseInt(data.grade),
        semester: parseInt(data.semester),
        lesson: parseInt(data.lesson),
        strokeCount: parseInt(data.strokeCount),
        examples: data.examples.split('\n').filter(ex => ex.trim() !== '')
      };

      await addDoc(collection(db, 'characters'), characterData);
      alert('單字新增成功！');
      reset();
    } catch (error) {
      console.error('新增單字錯誤:', error);
      alert(`新增失敗: ${error.message}`);
    }
    setFormLoading(false);
  };

  const handleDeleteCharacter = async (id) => {
    if (window.confirm('確定要刪除此單字嗎？')) {
      try {
        await deleteDoc(doc(db, 'characters', id));
        setCharacters(characters.filter(char => char.id !== id));
        alert('單字已刪除');
      } catch (error) {
        console.error('刪除單字錯誤:', error);
        alert(`刪除失敗: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-yellow-100 to-orange-100">
        <div className="loader">
          <div className="loader-dot bg-yellow-400"></div>
          <div className="loader-dot bg-yellow-400"></div>
          <div className="loader-dot bg-yellow-400"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // 路由重定向會處理，這裡不需要渲染內容
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 to-orange-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center yellow-gradient-text">
          管理員界面
        </h1>
        
        {/* 選項卡 */}
        <div className="bg-white rounded-t-3xl shadow-lg overflow-hidden mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-4 text-center font-bold transition ${
                activeTab === 'add' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              新增單字
            </button>
            <button
              onClick={() => {
                setActiveTab('manage');
                fetchCharacters();
              }}
              className={`flex-1 py-4 text-center font-bold transition ${
                activeTab === 'manage' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              管理單字
            </button>
          </div>
        </div>
        
        {/* 新增單字表單 */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    漢字
                  </label>
                  <input
                    type="text"
                    {...register('character', { required: '請輸入單一漢字', maxLength: 1 })}
                    className="input-cute focus:ring-yellow-300"
                    placeholder="單一漢字"
                  />
                  {errors.character && (
                    <p className="mt-1 text-xs text-red-500">{errors.character.message || '請輸入單一漢字'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    注音
                  </label>
                  <input
                    type="text"
                    {...register('zhuyin', { required: '請輸入注音' })}
                    className="input-cute focus:ring-yellow-300"
                    placeholder="ㄅㄆㄇㄈ"
                  />
                  {errors.zhuyin && (
                    <p className="mt-1 text-xs text-red-500">{errors.zhuyin.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    字義
                  </label>
                  <input
                    type="text"
                    {...register('meaning')}
                    className="input-cute focus:ring-yellow-300"
                    placeholder="字的意思"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出版社
                  </label>
                  <select
                    {...register('publisher', { required: '請選擇出版社' })}
                    className="input-cute focus:ring-yellow-300"
                  >
                    <option value="康軒">康軒</option>
                    <option value="南一">南一</option>
                    <option value="翰林">翰林</option>
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
                    className="input-cute focus:ring-yellow-300"
                  >
                    {[1, 2, 3, 4, 5, 6].map(grade => (
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
                    className="input-cute focus:ring-yellow-300"
                  >
                    <option value="1">第1學期</option>
                    <option value="2">第2學期</option>
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
                    {...register('lesson', { required: '請輸入課次', min: 1 })}
                    className="input-cute focus:ring-yellow-300"
                    placeholder="第幾課"
                  />
                  {errors.lesson && (
                    <p className="mt-1 text-xs text-red-500">{errors.lesson.message || '請輸入有效的課次'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    筆畫數
                  </label>
                  <input
                    type="number"
                    {...register('strokeCount', { required: '請輸入筆畫數', min: 1 })}
                    className="input-cute focus:ring-yellow-300"
                    placeholder="筆畫數量"
                  />
                  {errors.strokeCount && (
                    <p className="mt-1 text-xs text-red-500">{errors.strokeCount.message || '請輸入有效的筆畫數'}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    例句 (每行一句)
                  </label>
                  <textarea
                    {...register('examples')}
                    rows="4"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition"
                    placeholder="請輸入例句，每行一句"
                  ></textarea>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition disabled:opacity-70"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    處理中...
                  </div>
                ) : '新增單字'}
              </button>
            </form>
          </div>
        )}
        
        {/* 管理單字列表 */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">單字列表</h2>
              <button
                onClick={fetchCharacters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition"
              >
                刷新
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="loader">
                  <div className="loader-dot bg-yellow-400"></div>
                  <div className="loader-dot bg-yellow-400"></div>
                  <div className="loader-dot bg-yellow-400"></div>
                </div>
              </div>
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map(char => (
                  <div key={char.id} className="bg-gray-50 rounded-xl p-4 flex items-center">
                    <div className="mr-4 w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center font-bold text-xl">
                      {char.character}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{char.character} - {char.zhuyin}</p>
                          <p className="text-sm text-gray-600">
                            {char.publisher} {char.grade}年級 第{char.semester}學期 第{char.lesson}課
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCharacter(char.id)}
                          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded-full transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">目前尚無單字數據</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}