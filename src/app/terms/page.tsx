// src/app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款',
  description: '小字苗-國小漢字學習平台的服務條款，說明使用本網站的條件和規則。',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">服務條款</h1>
          
          <div className="text-gray-600 mb-6">
            <p><strong>最後更新日期：</strong> {new Date().toLocaleDateString('zh-TW')}</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 服務概述</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  小字苗-國小漢字學習平台（以下簡稱「本服務」）是一個專為國小學童設計的中文漢字學習平台，
                  提供互動式練習、進度追蹤和家長監控功能。
                </p>
                <p>
                  使用本服務即表示您同意遵守本服務條款的所有條件。
                  如果您不同意這些條款，請勿使用本服務。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 用戶資格</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>本服務主要面向國小學童（6-12歲）及其家長</li>
                  <li>13歲以下兒童使用本服務需要家長或監護人的同意</li>
                  <li>用戶必須提供真實、準確的註冊資訊</li>
                  <li>每個用戶只能擁有一個帳戶</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 帳戶責任</h2>
              <div className="space-y-4 text-gray-700">
                <p>用戶有責任：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>保護帳戶密碼的安全性</li>
                  <li>對帳戶下的所有活動負責</li>
                  <li>立即通知我們任何未經授權的帳戶使用</li>
                  <li>定期更新個人資訊以確保準確性</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 使用規範</h2>
              <div className="space-y-4 text-gray-700">
                <p>使用本服務時，您同意：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>僅將本服務用於合法和教育目的</li>
                  <li>不上傳或分享有害、非法或不當的內容</li>
                  <li>不企圖破壞、干擾或未經授權訪問本服務</li>
                  <li>不使用自動化工具或機器人程式</li>
                  <li>尊重其他用戶的權利和隱私</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 知識產權</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本服務的所有內容，包括但不限於：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>文字、圖片、音頻、視頻等教學材料</li>
                  <li>軟體程式碼和網站設計</li>
                  <li>商標、標誌和品牌識別</li>
                  <li>學習系統和教學方法</li>
                </ul>
                <p>
                  均受著作權法和其他知識產權法保護。未經書面許可，
                  用戶不得複製、修改、分發或商業使用這些內容。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 用戶生成內容</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  對於用戶在本服務中創建或上傳的內容：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>用戶保留其內容的所有權</li>
                  <li>用戶授予我們使用、修改、公開展示這些內容的權利</li>
                  <li>用戶保證其內容不侵犯他人權利</li>
                  <li>我們有權移除不當或違規的內容</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 廣告和第三方服務</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本服務可能包含：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>第三方廣告（如Google AdSense）</li>
                  <li>外部網站或服務的連結</li>
                  <li>第三方提供的內容或功能</li>
                </ul>
                <p>
                  我們不對第三方服務的內容、政策或做法負責。
                  用戶與第三方的互動完全由用戶自行承擔風險。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 服務可用性</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們努力保持服務的可用性，但不保證：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>服務將持續不間斷運行</li>
                  <li>服務完全無錯誤或安全漏洞</li>
                  <li>所有功能在所有設備上都能正常工作</li>
                </ul>
                <p>
                  我們有權在必要時暫停或終止服務，並會盡量提前通知用戶。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. 免責聲明</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本服務按「現狀」提供，我們不提供任何明示或暗示的保證：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>不保證服務滿足用戶的特定需求</li>
                  <li>不保證學習效果或教育成果</li>
                  <li>不對因使用本服務導致的任何損失負責</li>
                  <li>不對第三方內容或服務負責</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. 責任限制</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  在法律允許的最大範圍內，我們對以下損失不承擔責任：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>間接、特殊、偶然或懲罰性損害</li>
                  <li>利潤損失、數據丟失或業務中斷</li>
                  <li>超過用戶支付給我們的費用金額的損失</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. 終止服務</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們有權在以下情況下終止用戶帳戶：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>違反本服務條款</li>
                  <li>長期未使用帳戶</li>
                  <li>涉及非法或有害活動</li>
                  <li>其他我們認為必要的情況</li>
                </ul>
                <p>
                  用戶也可以隨時要求刪除帳戶和相關數據。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. 法律適用</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本服務條款受中華民國法律管轄。任何爭議將優先通過友好協商解決，
                  如無法達成一致，將提交至台灣地區有管轄權的法院處理。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. 條款修改</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們可能會不時修改本服務條款。重大變更將會通過以下方式通知用戶：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>在網站上發布公告</li>
                  <li>通過電子郵件通知</li>
                  <li>在用戶登入時顯示通知</li>
                </ul>
                <p>
                  繼續使用服務即表示接受修改後的條款。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. 聯絡資訊</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  如有任何關於本服務條款的問題，請聯絡我們：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>電子郵件：legal@xiaoziemiao.com</li>
                  <li>聯絡頁面：<a href="/contact" className="text-blue-600 hover:underline">聯絡我們</a></li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              感謝您使用小字苗-國小漢字學習平台！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}