// src/app/page.js
import Link from 'next/link';
import { BigLogo, BRAND } from '@/constants/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 pt-16 bg-gradient-to-b from-white to-blue-50">
      <div className="flex justify-center mb-8 animate-float">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
             <BigLogo />
       </div>
     </div>

     <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
       {BRAND.fullName}
     </h1>
     
     <p className="text-xl mb-12 text-center max-w-2xl text-gray-600">
       幫助家長追蹤孩子的漢字學習進度，查詢課本單字，並提供有趣的練習功能。
     </p>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 max-w-7xl w-full px-4">
       <Link href="/characters" 
         className="group relative overflow-hidden p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
         <div className="absolute right-4 top-4 w-20 h-20 bg-pink-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
         <div className="relative z-10">
           <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
             </div>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">單字查詢</h2>
           <p className="text-center text-gray-700">查詢特定漢字是否已學過</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-pink-500 font-medium text-sm shadow-md group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
               開始查詢
             </span>
           </div>
         </div>
       </Link>
       
       <Link href="/characters/practice" 
         className="group relative overflow-hidden p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
         <div className="absolute right-4 top-4 w-20 h-20 bg-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
         <div className="relative z-10">
           <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
               </svg>
             </div>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">寫字練習</h2>
           <p className="text-center text-gray-700">互動式筆順練習與書寫訓練</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-green-500 font-medium text-sm shadow-md group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
               開始練習
             </span>
           </div>
         </div>
       </Link>

       <Link href="/practice-sheet" 
         className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
         <div className="absolute right-4 top-4 w-20 h-20 bg-blue-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
         <div className="relative z-10">
           <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
             </div>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">列印寫字簿</h2>
           <p className="text-center text-gray-700">生成可列印的田字格練習簿</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-blue-500 font-medium text-sm shadow-md group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
               立即生成
             </span>
           </div>
         </div>
       </Link>

       <Link href="/cumulative-characters" 
         className="group relative overflow-hidden p-6 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
         <div className="absolute right-4 top-4 w-20 h-20 bg-purple-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
         <div className="relative z-10">
           <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
             </div>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">累積漢字表</h2>
           <p className="text-center text-gray-700">查看學習進度中所有累積的漢字列表</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-purple-500 font-medium text-sm shadow-md group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
               查看漢字表
             </span>
           </div>
         </div>
       </Link>
     </div>
     
     {/* 特色區塊 */}
     <div className="mt-20 mb-16 max-w-4xl w-full">
       <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
         學習特色
       </h2>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
             </svg>
           </div>
           <h3 className="text-xl font-bold mb-2 text-gray-800">教材同步</h3>
           <p className="text-center text-gray-600">完全對應各版本教材內容，輕鬆追蹤學習進度</p>
         </div>
         
         <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold mb-2 text-gray-800">互動學習</h3>
           <p className="text-center text-gray-600">生動有趣的練習模式，提高孩子學習興趣</p>
         </div>
         
         <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0014.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold mb-2 text-gray-800">家長參與</h3>
           <p className="text-center text-gray-600">專為家長設計的界面，輕鬆參與孩子的學習過程</p>
         </div>
       </div>
     </div>

     {/* 開始使用按鈕 */}
     <div className="mb-16">
       <Link href="/register" 
         className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-full hover:from-pink-500 hover:to-purple-500 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
         立即開始使用
       </Link>
     </div>
   </main>
  );
}