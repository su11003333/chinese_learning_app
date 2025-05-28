// src/app/characters/page.js
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CharacterSearch() {
  const { register, handleSubmit } = useForm();
  const [publishers, setPublishers] = useState(['康軒', '南一', '翰林']);
  const [grades, setGrades] = useState([1, 2, 3, 4, 5, 6]);
  const [semesters, setSemesters] = useState([1, 2]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('pink'); // 用於變換顏色主題

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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { publisher, grade, semester, character } = data;
      
      // 建立查詢
      const charactersRef = collection(db, "characters");
      let q = query(
        charactersRef,
        where("publisher", "==", publisher),
        where("grade", "==", parseInt(grade)),
        where("semester", "==", parseInt(semester)),
        where("character", "==", character)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // 找到了單字
        setSearchResult({
          found: true,
          data: querySnapshot.docs[0].data()
        });
        
        // 根據出版社變更顏色主題
        if (publisher === '康軒') setSelectedColor('pink');
        else if (publisher === '南一') setSelectedColor('blue');
        else if (publisher === '翰林') setSelectedColor('yellow');
      } else {
        // 沒找到單字
        setSearchResult({
          found: false,
          character
        });
      }
    } catch (error) {
      console.error("查詢錯誤:", error);
      setSearchResult({
        found: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${theme.bg}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme.title}`}>
          累積單字查詢
        </h1>
        
        <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版社
                </label>
                <select
                  {...register('publisher', { required: true })}
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                  onChange={(e) => {
                    // 根據選擇的出版社變更顏色主題
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年級
                </label>
                <select
                  {...register('grade', { required: true })}
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}年級</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  學期
                </label>
                <select
                  {...register('semester', { required: true })}
                  className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>第{semester}學期</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                查詢單字
              </label>
              <input
                type="text"
                {...register('character', { required: true, maxLength: 1 })}
                className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
                placeholder="請輸入一個漢字"
              />
            </div>
            
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
                  查詢中...
                </div>
              ) : '查詢'}
            </button>
          </form>
        </div>
        
        {searchResult && (
          <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8 transform transition duration-300 animate-float`}>
            {searchResult.found ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold">{searchResult.data.character}</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{searchResult.data.character}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-600 text-sm mb-1">注音</p>
                    <p className="font-medium text-lg">{searchResult.data.zhuyin}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-600 text-sm mb-1">筆畫數</p>
                    <p className="font-medium text-lg">{searchResult.data.strokeCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-600 text-sm mb-1">出版社</p>
                    <p className="font-medium">{searchResult.data.publisher}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-600 text-sm mb-1">課程</p>
                    <p className="font-medium">{searchResult.data.grade}年級 第{searchResult.data.semester}學期 第{searchResult.data.lesson}課</p>
                  </div>
                </div>
                
                {searchResult.data.examples && searchResult.data.examples.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">例句</p>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <ul className="space-y-2">
                        {searchResult.data.examples.map((example, index) => (
                          <li key={index} className="font-medium">{example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {/* 實現朗讀功能 */}}
                    className="mr-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.414 1.414m-.88-12.728a9 9 0 0112.728 0" />
                    </svg>
                    朗讀
                  </button>
                  <button
                    onClick={() => {/* 實現筆順動畫功能 */}}
                    className="px-4 py-2 bg-green-100 text-green-600 rounded-full font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    筆順
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {searchResult.error 
                    ? `查詢發生錯誤` 
                    : `「${searchResult.character}」未在所選教材中找到`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchResult.error 
                    ? searchResult.error
                    : `請嘗試其他版本或年級，或確認字元輸入正確。`}
                </p>
                
                <button
                  onClick={() => setSearchResult(null)}
                  className={`px-6 py-2 ${theme.button} text-white rounded-full font-medium`}
                >
                  重新查詢
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}