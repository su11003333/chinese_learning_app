// src/app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隱私政策',
  description: '小字苗-國小漢字學習平台的隱私政策，說明我們如何收集、使用和保護您的個人資料。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">隱私政策</h1>
          
          <div className="text-gray-600 mb-6">
            <p><strong>最後更新日期：</strong> {new Date().toLocaleDateString('zh-TW')}</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 資料收集</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們收集以下類型的資料：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>個人資料：</strong>姓名、電子郵件地址等註冊時提供的資訊</li>
                  <li><strong>使用資料：</strong>學習進度、練習記錄、網站互動資料</li>
                  <li><strong>技術資料：</strong>IP地址、瀏覽器類型、設備資訊</li>
                  <li><strong>Cookie資料：</strong>網站功能和廣告相關的追蹤資料</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 資料使用目的</h2>
              <div className="space-y-4 text-gray-700">
                <p>我們使用收集的資料用於：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>提供和改善我們的教育服務</li>
                  <li>追蹤學習進度和個人化學習體驗</li>
                  <li>與您溝通服務相關事項</li>
                  <li>進行網站分析和改善用戶體驗</li>
                  <li>展示相關廣告內容</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Google AdSense和廣告</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本網站使用Google AdSense顯示廣告。Google可能會：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>使用Cookie和網路信標來投放廣告</li>
                  <li>根據您對本網站和其他網站的訪問記錄投放廣告</li>
                  <li>您可以通過訪問<a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google廣告設定</a>來選擇退出個人化廣告</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Cookie政策</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們使用Cookie來：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>記住您的登入狀態和偏好設定</li>
                  <li>分析網站流量和使用模式</li>
                  <li>提供個人化廣告內容</li>
                  <li>改善網站功能和用戶體驗</li>
                </ul>
                <p>
                  您可以通過瀏覽器設定來控制Cookie的使用，但這可能會影響網站的某些功能。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 資料保護</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們採取適當的技術和組織措施來保護您的個人資料：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>使用SSL加密傳輸敏感資料</li>
                  <li>定期更新安全措施</li>
                  <li>限制對個人資料的訪問權限</li>
                  <li>定期備份和安全監控</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 第三方服務</h2>
              <div className="space-y-4 text-gray-700">
                <p>本網站整合以下第三方服務：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Firebase：</strong>身份驗證和資料儲存</li>
                  <li><strong>Google Analytics：</strong>網站流量分析</li>
                  <li><strong>Google AdSense：</strong>廣告服務</li>
                  <li><strong>Cloudflare：</strong>內容傳遞和安全服務</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 兒童隱私</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們的服務主要面向國小學童，我們特別重視兒童隱私保護：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>13歲以下兒童註冊需要家長同意</li>
                  <li>我們不會故意收集13歲以下兒童的個人資料</li>
                  <li>家長可以隨時要求查看、修改或刪除其子女的資料</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 您的權利</h2>
              <div className="space-y-4 text-gray-700">
                <p>您擁有以下權利：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>查看我們持有的您的個人資料</li>
                  <li>要求更正錯誤的個人資料</li>
                  <li>要求刪除您的個人資料</li>
                  <li>限制處理您的個人資料</li>
                  <li>資料可攜權</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. 聯絡我們</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  如果您對本隱私政策有任何疑問，請通過以下方式聯絡我們：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>電子郵件：privacy@xiaoziemiao.com</li>
                  <li>聯絡頁面：<a href="/contact" className="text-blue-600 hover:underline">聯絡我們</a></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. 政策更新</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  我們可能會不時更新此隱私政策。重大變更將會通過網站公告或電子郵件通知您。
                  建議您定期查看本頁面以了解最新的隱私保護做法。
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              此隱私政策符合《個人資料保護法》及相關法規要求。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}