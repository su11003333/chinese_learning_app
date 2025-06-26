// src/app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '關於我們',
  description: '了解小字苗-國小漢字學習平台的使命、願景和團隊，我們致力於為國小學童提供最優質的中文學習體驗。',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12">
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 714.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 717.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 716 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 713.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-6">關於小字苗</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我們致力於為國小學童打造最優質的中文漢字學習平台，
            讓每個孩子都能在快樂中學習，在學習中成長。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 使命願景 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">我們的使命</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>讓中文學習變得簡單有趣。</strong>
                我們相信每個孩子都有學習中文的潛能，
                透過科技的力量和創新的教學方法，
                我們要讓漢字學習不再是負擔，而是一種享受。
              </p>
              <p>
                我們的目標是幫助國小學童：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>建立扎實的漢字基礎</li>
                <li>培養對中文的興趣和信心</li>
                <li>提升閱讀理解和表達能力</li>
                <li>養成良好的學習習慣</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">我們的願景</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>成為華語世界最受信賴的兒童中文學習平台。</strong>
                我們希望透過持續的創新和改進，
                為全球華語兒童提供最專業、最有效的中文學習解決方案。
              </p>
              <p>
                我們的核心價值：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>教育為本：</strong>以學習成效為首要考量</li>
                <li><strong>創新求進：</strong>不斷改進教學方法和技術</li>
                <li><strong>安全第一：</strong>保護兒童的隱私和安全</li>
                <li><strong>家長信賴：</strong>成為家長教育孩子的好夥伴</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 平台特色 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#3B82F6" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">教材同步</h3>
              <p className="text-gray-600">
                完全對應康軒、南一、翰林等主要版本教材，
                讓課內外學習無縫接軌。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#10B981" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">互動練習</h3>
              <p className="text-gray-600">
                結合動畫、遊戲和互動元素，
                讓孩子在玩樂中自然學會漢字。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8B5CF6" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">進度追蹤</h3>
              <p className="text-gray-600">
                智能分析學習狀況，
                為家長和老師提供詳細的學習報告。
              </p>
            </div>
          </div>
        </div>


        {/* 聯絡資訊 */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">聯絡我們</h2>
          <p className="text-lg text-gray-700 mb-6">
            有任何問題或建議嗎？我們很樂意聽到您的聲音！
          </p>
          <div className="mt-6">
            <a href="/contact" className="inline-block px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-full hover:from-pink-500 hover:to-purple-500 transition duration-300 transform hover:-translate-y-1 shadow-lg">
              前往聯絡頁面
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}