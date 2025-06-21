// src/app/practice-sheet/page.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, FileText, BookOpen, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { publishers, grades, semesters } from '../../constants/data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PracticeSheetPage() {
  const [quickSelectForm, setQuickSelectForm] = useState({
    publisher: '康軒',
    grade: 1,
    semester: 1,
    lesson: 1
  });
  const [characters, setCharacters] = useState([]);
  const [practiceSheet, setPracticeSheet] = useState(null);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [selectedFont, setSelectedFont] = useState('mingti'); // 新增字體選擇狀態

  // 字體選項設定
  const fontOptions = {
    mingti: {
      name: '明體',
      family: "'PMingLiU', '新細明體', 'MingLiU', '細明體', 'Times New Roman', serif",
      description: '傳統印刷字體，筆劃清晰'
    },
    kaiti: {
      name: '楷體',
      family: "'DFKai-SB', '標楷體', 'STKaiti', 'KaiTi', '楷體', 'BiauKai', cursive",
      description: '手寫風格字體，筆劃優美'
    },
    fangsong: {
      name: '仿宋體',
      family: "'STFangsong', 'FangSong', '仿宋', 'FangSong_GB2312', '仿宋_GB2312', fantasy",
      description: '古典書法字體，端莊典雅'
    }
  };

  // 顏色主題設定
  const colorThemes = {
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-purple-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
      input: 'focus:ring-pink-300',
      title: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
      border: 'border-pink-200',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-green-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500',
      input: 'focus:ring-blue-300',
      title: 'bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent',
      border: 'border-blue-200',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
      input: 'focus:ring-yellow-300',
      title: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent',
      border: 'border-yellow-200',
    }
  };

  const theme = colorThemes[selectedColor];

  // 根據出版社變更主題色彩
  const handlePublisherChange = (publisher) => {
    setQuickSelectForm(prev => ({ ...prev, publisher }));
    if (publisher === '康軒') setSelectedColor('pink');
    else if (publisher === '南一') setSelectedColor('blue');
    else if (publisher === '翰林') setSelectedColor('yellow');
  };

  // 載入可用課程列表
  const loadAvailableLessons = async (publisher, grade, semester) => {
    setIsLoadingLessons(true);
    try {
      const lessonsRef = collection(db, "lessons");
      const q = query(
        lessonsRef,
        where("publisher", "==", publisher),
        where("grade", "==", grade),
        where("semester", "==", semester)
      );
      
      const querySnapshot = await getDocs(q);
      const lessons = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lessons.push({
          lesson: data.lesson,
          title: data.title || '', // 加入課文標題
          characterCount: data.characters?.length || 0,
          id: doc.id
        });
      });
      
      // 按課次排序
      lessons.sort((a, b) => a.lesson - b.lesson);
      setAvailableLessons(lessons);
    } catch (error) {
      console.error('載入課程列表失敗:', error);
      setAvailableLessons([]);
    }
    setIsLoadingLessons(false);
  };

  // 載入指定課程的所有字符
  const loadLessonCharacters = async (publisher, grade, semester, lesson) => {
    setIsLoadingCharacters(true);
    setMessage('正在載入課程字符...');
    
    try {
      // 建立課程 ID
      const lessonId = `${publisher}_${grade}_${semester}_${lesson}`;
      
      // 從 lessons collection 獲取課程資料
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);
      
      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        const charactersData = lessonData.characters || [];
        
        if (charactersData.length > 0) {
          // 轉換資料格式
          const formattedCharacters = charactersData.map((charObj) => ({
            character: charObj.character,
            zhuyin: charObj.zhuyin || ''
          }));
          
          setCharacters(formattedCharacters);
          setMessage(`成功載入 ${publisher} ${grade}年級第${semester}學期第${lesson}課，共 ${formattedCharacters.length} 個字符`);
        } else {
          setMessage('該課程沒有找到字符資料');
          setCharacters([]);
        }
      } else {
        setMessage('找不到指定的課程資料');
        setCharacters([]);
      }
    } catch (error) {
      console.error('載入課程字符失敗:', error);
      setMessage('載入課程字符失敗，請稍後再試');
      setCharacters([]);
    }
    
    setIsLoadingCharacters(false);
  };

  // 初始載入可用課程
  useEffect(() => {
    loadAvailableLessons(quickSelectForm.publisher, quickSelectForm.grade, quickSelectForm.semester);
  }, [quickSelectForm.publisher, quickSelectForm.grade, quickSelectForm.semester]);

  // 繪製九宮格
  const drawNineSquareGrid = (pdf, x, y, width, height) => {
    // 外框
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // 九宮格線
    const cellW = width / 3;
    const cellH = height / 3;
    
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    
    // 垂直線
    for (let i = 1; i < 3; i++) {
      pdf.line(x + i * cellW, y, x + i * cellW, y + height);
    }
    
    // 水平線
    for (let i = 1; i < 3; i++) {
      pdf.line(x, y + i * cellH, x + width, y + i * cellH);
    }
    
    // 中心十字線
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);
    pdf.line(x + width / 2, y, x + width / 2, y + height);
    pdf.line(x, y + height / 2, x + width, y + height / 2);
  };

  // 生成練習單
  const generatePracticeSheet = async () => {
    setIsGenerating(true);
    try {
      const lessonData = {
        publisher: quickSelectForm.publisher,
        grade: quickSelectForm.grade,
        semester: quickSelectForm.semester,
        lesson: quickSelectForm.lesson
      };
      
      if (characters.length === 0) {
        alert('此課程沒有生字資料');
        return;
      }
      
      // 找到對應的課程標題
      const lessonInfo = availableLessons.find(l => l.lesson === quickSelectForm.lesson);
      
      const sheet = {
        ...lessonData,
        title: lessonInfo?.title || '', // 加入課文標題
        characters,
        generatedAt: new Date().toISOString()
      };
      
      setPracticeSheet(sheet);
    } catch (error) {
      console.error('生成練習單失敗:', error);
      alert('生成練習單失敗，請稍後再試');
    }
    setIsGenerating(false);
  };

  // 生成 PDF
  const generatePDF = async () => {
    if (characters.length === 0) {
      setMessage('請先載入生字資料');
      return;
    }

    setIsGenerating(true);
    
    try {
      // 使用 html2canvas + jsPDF 的方式
      // 先創建一個隱藏的 HTML 模板
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '210mm';
      printContainer.style.background = 'white';
      printContainer.style.fontFamily = fontOptions[selectedFont].family;
      document.body.appendChild(printContainer);

      // 每頁最多 6 個字符（每個字符佔據一列）
      const charactersPerPage = 6;
      const practiceRows = 10; // 每個字 10 行練習

      for (let pageIndex = 0; pageIndex < Math.ceil(characters.length / charactersPerPage); pageIndex++) {
        const pageCharacters = characters.slice(
          pageIndex * charactersPerPage,
          (pageIndex + 1) * charactersPerPage
        );

        // 創建頁面內容
        const pageHtml = `
          <div style="
            width: 210mm; 
            height: 297mm; 
            padding: 8mm 8mm 8mm 2mm; 
            background: white; 
            font-family: ${fontOptions[selectedFont].family};
            box-sizing: border-box;
          ">
            <!-- 標題 -->
            <div style="text-align: center; margin-bottom: 8mm; font-size: 14px; font-weight: bold; color: #000;">
              ${quickSelectForm.publisher} ${quickSelectForm.grade}年級第${quickSelectForm.semester}學期第${quickSelectForm.lesson}課${practiceSheet?.title ? ` ${practiceSheet.title}` : ''} - 生字練習
            </div>
            
            <!-- 練習網格 - 6欄，從右到左 -->
            <div style="display: flex; width: 100%; gap: 0; justify-content: flex-start; direction: rtl; margin-top: 20mm; margin-left: -10mm">
              ${Array.from({ length: 6 }, (_, colIndex) => {
                const char = pageCharacters[colIndex]; // 可能為 undefined
                return `
                <div style="display: flex; flex-direction: column; direction: ltr;">
                  <!-- 字符練習列 -->
                  ${Array.from({ length: practiceRows }, (_, rowIndex) => `
                    <div style="display: flex; border: none; margin: 0;">
                      <!-- 漢字田字格 -->
                      <div style="
                        width: 22mm; 
                        height: 22mm; 
                        border: 1px solid #000; 
                        position: relative;
                        background: white;
                        ${rowIndex === 0 ? 'border-top: 2px solid #000;' : ''}
                        ${colIndex === 0 ? 'border-right: 2px solid #000;' : ''}
                        ${colIndex === 5 ? 'border-left: 2px solid #000;' : ''}
                        ${rowIndex === practiceRows - 1 ? 'border-bottom: 2px solid #000;' : ''}
                      ">
                        <!-- 田字格線 - 十字線（更淡） -->
                        <div style="position: absolute; left: calc(50% - 0.5px); top: 0; width: 1px; height: 100%; background: #ddd;"></div>
                        <div style="position: absolute; top: calc(50% - 0.5px); left: 0; width: 100%; height: 1px; background: #ddd;"></div>
                        
                        <!-- 示範字（前5行顯示） - 只有當字符存在時 -->
                        ${(rowIndex < 5 && char) ? `
                          <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 52px;
                            color: #D0D0D0;
                            font-weight: 400;
                            font-family: ${fontOptions[selectedFont].family};
                          ">
                            <span style="
                              display: block;
                              line-height: 1;
                              transform: translateY(-26px);
                            ">${char.character}</span>
                          </div>
                        ` : ''}
                      </div>
                      
                      <!-- 注音格 -->
                      <div style="
                        width: 7mm; 
                        height: 22mm; 
                        border: 1px solid #000; 
                        border-left: none;
                        background: white;
                        ${rowIndex === 0 ? 'border-top: 2px solid #000;' : ''}
                        ${colIndex === 0 ? 'border-right: 2px solid #000;' : ''}
                        ${rowIndex === practiceRows - 1 ? 'border-bottom: 2px solid #000;' : ''}
                      ">
                        <!-- 注音格保持空白 -->
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
              }).join('')}
            </div>
          </div>
        `;

        printContainer.innerHTML = pageHtml;

        // 等待一小段時間讓內容渲染
        await new Promise(resolve => setTimeout(resolve, 100));

        // 使用 html2canvas 截圖
        const canvas = await html2canvas(printContainer, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: 'white',
          width: 794, // A4 寬度 (像素 - 210mm)
          height: 1123, // A4 高度 (像素 - 297mm)
          removeContainer: true,
          foreignObjectRendering: false,
          allowTaint: true
        });

        // 轉換為 PDF
        const imgData = canvas.toDataURL('image/png');
        
        if (pageIndex === 0) {
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
          
          // 儲存 PDF 實例以供後續頁面使用
          window.currentPdf = pdf;
        } else {
          window.currentPdf.addPage();
          window.currentPdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        }

        // 更新進度
        setMessage(`正在生成 PDF... (${pageIndex + 1}/${Math.ceil(characters.length / charactersPerPage)})`);
      }

      // 清理
      document.body.removeChild(printContainer);

      // 下載 PDF
      const fileName = `${quickSelectForm.publisher}_${quickSelectForm.grade}年級第${quickSelectForm.semester}學期第${quickSelectForm.lesson}課_生字練習.pdf`;
      window.currentPdf.save(fileName);
      window.currentPdf = null;
      
      setMessage('PDF 已成功生成並下載！');

    } catch (error) {
      console.error('生成 PDF 失敗:', error);
      setMessage('生成 PDF 失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 ${theme.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${theme.title}`}>
            生字練習簿產生器
          </h1>
          <p className="text-gray-600 text-lg">
            選擇教材版本和課程，自動生成可列印的生字練習簿
          </p>
        </div>

        {/* 課程選擇 */}
        <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${theme.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">選擇課程</h2>
            <p className="text-gray-600">選擇教材版本和課程，快速載入所有字符</p>
          </div>

          {/* 選擇表單 */}
          <div className="space-y-4">
            {/* 版本選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Layers size={18} />
                出版社
              </label>
              <select
                value={quickSelectForm.publisher}
                onChange={(e) => {
                  handlePublisherChange(e.target.value);
                }}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
              >
                {publishers.map(publisher => (
                  <option key={publisher} value={publisher}>{publisher}</option>
                ))}
              </select>
            </div>

            {/* 年級和學期 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap size={18} />
                  年級
                </label>
                <select
                  value={quickSelectForm.grade}
                  onChange={(e) => {
                    const grade = parseInt(e.target.value);
                    setQuickSelectForm(prev => ({ ...prev, grade }));
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}年級</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">學期</label>
                <select
                  value={quickSelectForm.semester}
                  onChange={(e) => {
                    const semester = parseInt(e.target.value);
                    setQuickSelectForm(prev => ({ ...prev, semester }));
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>第{semester}學期</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 課次選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課次
                {isLoadingLessons && (
                  <span className="ml-2 text-xs text-gray-500">載入中...</span>
                )}
              </label>
              <select
                value={quickSelectForm.lesson}
                onChange={(e) => setQuickSelectForm(prev => ({ ...prev, lesson: parseInt(e.target.value) }))}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.input} focus:ring-2 focus:border-transparent`}
                disabled={isLoadingLessons || availableLessons.length === 0}
              >
                <option value="">請選擇課次</option>
                {availableLessons.map(lessonInfo => (
                  <option key={lessonInfo.lesson} value={lessonInfo.lesson}>
                    第{lessonInfo.lesson}課{lessonInfo.title ? ` - ${lessonInfo.title}` : ''}
                  </option>
                ))}
              </select>
              {availableLessons.length === 0 && !isLoadingLessons && (
                <p className="mt-1 text-xs text-gray-500">此年級學期暫無課程資料</p>
              )}
            </div>

            {/* 載入按鈕 */}
            <button
              onClick={() => loadLessonCharacters(
                quickSelectForm.publisher,
                quickSelectForm.grade,
                quickSelectForm.semester,
                quickSelectForm.lesson
              )}
              disabled={isLoadingCharacters}
              className={`w-full py-3 px-6 ${theme.button} text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            >
              {isLoadingCharacters ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  載入中...
                </div>
              ) : `載入第${quickSelectForm.lesson}課`}
            </button>


          </div>
        </div>

        {/* 生字預覽和下載 */}
        {characters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme.card} rounded-3xl shadow-xl p-6`}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {quickSelectForm.publisher} {quickSelectForm.grade}年級第{quickSelectForm.semester}學期第{quickSelectForm.lesson}課
                {availableLessons.find(l => l.lesson === quickSelectForm.lesson)?.title && ` - ${availableLessons.find(l => l.lesson === quickSelectForm.lesson).title}`}
              </h2>
              <p className="text-gray-600">共 {characters.length} 個生字</p>
            </div>

            {/* 字體選擇器 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                選擇字體樣式
              </label>
              <div className="flex justify-center gap-4">
                {Object.entries(fontOptions).map(([key, font]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFont(key)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedFont === key
                        ? `${theme.button.replace('hover:', '')} text-white border-transparent`
                        : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                       <div 
                         className="text-2xl font-bold mb-1" 
                         style={{ fontFamily: font.family }}
                       >
                         學習
                       </div>
                       <div className="text-sm font-medium mb-1">{font.name}</div>
                       <div className="text-xs opacity-75">{font.description}</div>
                     </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 生字預覽 */}
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-6">
              {characters.map((char, index) => (
                <div
                  key={index}
                  className={`${theme.bg} border-2 ${theme.border} rounded p-2 text-center`}
                >
                  <div 
                    className="text-gray-800 text-xl font-bold"
                    style={{ fontFamily: fontOptions[selectedFont].family }}
                  >
                    {char.character}
                  </div>
                  <div className="text-gray-600 text-xs">{char.zhuyin}</div>
                </div>
              ))}
            </div>

            {/* 下載按鈕 */}
            <div className="text-center">
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    生成中...
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    下載練習簿 PDF
                  </>
                )}
              </button>
              <p className="text-gray-400 text-sm mt-2">
                將生成包含九宮格和淡色字體的練習簿，適合列印使用
              </p>
            </div>
          </motion.div>
        )}

        {/* 底部訊息顯示 */}
        {message && (
          <div className="mt-8">
            <div className={`p-4 rounded-2xl border-2 ${
              message.includes('成功') ? 'bg-green-50 border-green-200' :
              message.includes('失敗') || message.includes('錯誤') ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${
                  message.includes('成功') ? 'text-green-600' :
                  message.includes('失敗') || message.includes('錯誤') ? 'text-red-600' :
                  'text-blue-600'
                }`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium text-center ${
                  message.includes('成功') ? 'text-green-800' :
                  message.includes('失敗') || message.includes('錯誤') ? 'text-red-800' :
                  'text-blue-800'
                }`}>{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 使用說明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} />
            使用說明
          </h3>
          <div className="text-gray-600 space-y-2 text-sm">
            <p>• <strong>選擇課程：</strong>依序選擇教材版本、年級、學期和課程</p>
            <p>• <strong>載入生字：</strong>系統將從資料庫載入對應的生字資料</p>
            <p>• <strong>生成 PDF：</strong>自動產生包含九宮格的練習簿，每個字都有淡色輪廓和注音</p>
            <p>• <strong>列印練習：</strong>下載 PDF 後可直接列印，適合 A4 紙張</p>
            <p>• <strong>練習格式：</strong>每頁 18 個字，採用標準九宮格格式，包含注音</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}