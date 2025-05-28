// src/app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 pt-16 bg-gradient-to-b from-white to-blue-50">
      <div className="flex justify-center mb-8 animate-float">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <div className="absolute w-full h-full bg-pink-200 rounded-full flex items-center justify-center">
            <div className="w-5/6 h-5/6 bg-pink-300 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12 sm:w-16 sm:h-16">
              // src/app/page.js (續)
               <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
               <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
               <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
             </svg>
           </div>
         </div>
       </div>
     </div>

     <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
       國小漢字學習平台
     </h1>
     
     <p className="text-xl mb-12 text-center max-w-2xl text-gray-600">
       幫助家長追蹤孩子的漢字學習進度，查詢課本單字，並提供有趣的練習功能。
     </p>
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl w-full px-4">
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
           <h2 className="text-2xl font-bold mb-2 text-center">累積單字查詢</h2>
           <p className="text-center text-gray-700">查詢各版本教材中的漢字和單字，了解學習進度</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-pink-500 font-medium text-sm shadow-md group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
               開始查詢
             </span>
           </div>
         </div>
       </Link>
       
       <Link href="/practice" 
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
           <h2 className="text-2xl font-bold mb-2 text-center">造句練習</h2>
           <p className="text-center text-gray-700">使用已學過的單字進行造句練習，提升寫作能力</p>
           <div className="mt-4 flex justify-center">
             <span className="px-4 py-2 bg-white rounded-full text-green-500 font-medium text-sm shadow-md group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
               開始練習
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
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold mb-2 text-gray-800">家長參與</h3>
           <p className="text-center text-gray-600">專為家長設計的界面，輕鬆參與孩子的學習過程</p>
         </div>
       </div>
     </div>

     {/* 開始使用按鈕 */}
     <div className="mb-16">
       <Link href="/auth/register" 
         className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-full hover:from-pink-500 hover:to-purple-500 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
         立即開始使用
       </Link>
     </div>
   </main>
 );
}