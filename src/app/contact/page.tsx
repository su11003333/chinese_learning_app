// src/app/contact/page.tsx
import { Metadata } from 'next';
import { BRAND } from '@/constants/logo';

export const metadata: Metadata = {
  title: '聯絡我們',
  description: '有任何問題或建議嗎？透過小字苗-國小漢字學習平台的聯絡頁面與我們取得聯繫，我們很樂意為您提供協助。',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          {/* Construction Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#F59E0B" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-6">建構中</h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            我們正在為您打造更好的聯絡體驗！
            聯絡頁面目前正在升級中，敬請期待。
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">現在可以這樣聯絡我們：</h2>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-center justify-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="font-medium">電子郵件：</span>
                <span>support@xiaoziemiao.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                <span className="font-medium">客服時間：</span>
                <span>週一至週五 9:00-18:00</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            預計完成時間：近期內
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:from-pink-500 hover:to-purple-500 transition duration-300 transform hover:-translate-y-1"
            >
              返回首頁
            </a>
            <a 
              href="/about"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition duration-300"
            >
              了解更多
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              感謝您對 {BRAND.fullName} 的關注與支持！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}