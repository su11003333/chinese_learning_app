// src/app/practice-sheet/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, FileText, BookOpen, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';

// Constants - 如果沒有 constants/data 文件，使用內嵌常數
const VERSIONS = ['康軒', '翰林', '南一'];
const GRADES = ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
const LESSONS = Array.from({ length: 20 }, (_, i) => `第${i + 1}課`);

interface Character {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  grade: string;
  lesson: string;
  version: string;
}

export default function PracticeSheetPage() {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 使用常數
  const versions = VERSIONS;
  const grades = GRADES;
  const lessons = LESSONS;

  // 從 Firebase 獲取生字資料
  const fetchCharacters = async (): Promise<void> => {
    if (!selectedVersion || !selectedGrade || !selectedLesson) {
      alert('請選擇完整的課程資訊');
      return;
    }

    if (!db) {
      alert('Firebase 尚未初始化，請重新整理頁面');
      return;
    }

    setIsLoading(true);
    try {
      const charactersRef = collection(db, 'characters');
      const q = query(
        charactersRef,
        where('version', '==', selectedVersion),
        where('grade', '==', selectedGrade),
        where('lesson', '==', selectedLesson)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedCharacters: Character[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCharacters.push({
          id: doc.id,
          character: data.character,
          pinyin: data.pinyin || '',
          meaning: data.meaning || '',
          grade: data.grade,
          lesson: data.lesson,
          version: data.version
        });
      });

      if (fetchedCharacters.length === 0) {
        alert('找不到符合條件的生字資料');
      } else {
        setCharacters(fetchedCharacters);
      }
    } catch (error) {
      console.error('獲取生字資料失敗:', error);
      alert('獲取生字資料失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 繪製九宮格
  const drawNineSquareGrid = (pdf: jsPDF, x: number, y: number, width: number, height: number) => {
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

  // 生成 PDF
  const generatePDF = async () => {
    if (characters.length === 0) {
      alert('請先載入生字資料');
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const charactersPerPage = 18; // 每頁18個字 (6x3)
      
      // 分頁處理
      for (let pageIndex = 0; pageIndex < Math.ceil(characters.length / charactersPerPage); pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // 頁面標題
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const title = `${selectedVersion} ${selectedGrade}下 ${selectedLesson} - 生字練習 (第${pageIndex + 1}頁)`;
        pdf.text(title, pageWidth / 2, 20, { align: 'center' });
        
        // 當前頁的字符
        const pageCharacters = characters.slice(
          pageIndex * charactersPerPage, 
          (pageIndex + 1) * charactersPerPage
        );

        // 繪製字符網格
        const cols = 6;
        const cellWidth = (pageWidth - 2 * margin) / cols;
        const cellHeight = 35;
        const startY = 35;

        pageCharacters.forEach((char, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = margin + col * cellWidth;
          const y = startY + row * cellHeight;

          // 繪製九宮格
          drawNineSquareGrid(pdf, x, y, cellWidth, cellHeight);
          
          // 繪製字符（淡色）
          pdf.setTextColor(200, 200, 200);
          pdf.setFontSize(24);
          pdf.setFont('helvetica', 'normal');
          pdf.text(char.character, x + cellWidth / 2, y + cellHeight / 2 + 8, { align: 'center' });
          
          // 重置顏色
          pdf.setTextColor(0, 0, 0);
          
          // 添加注音和意思（小字）
          pdf.setFontSize(8);
          pdf.text(char.pinyin, x + 2, y + cellHeight - 8);
          pdf.text(char.meaning, x + 2, y + cellHeight - 2);
        });
      }

      // 下載 PDF
      const fileName = `${selectedVersion}_${selectedGrade}_${selectedLesson}_生字練習.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('生成 PDF 失敗:', error);
      alert('生成 PDF 失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FileText className="text-purple-400" />
            生字練習簿產生器
          </h1>
          <p className="text-gray-300">選擇課程，自動生成可列印的生字練習簿</p>
        </motion.div>

        {/* 選擇器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* 版本選擇 */}
            <div>
              <label className="block text-white mb-2 font-medium flex items-center gap-2">
                <Layers size={18} />
                教材版本
              </label>
              <div className="relative">
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 appearance-none"
                >
                  <option value="">請選擇版本</option>
                  {versions.map((version) => (
                    <option key={version} value={version} className="bg-slate-800">
                      {version}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* 年級選擇 */}
            <div>
              <label className="block text-white mb-2 font-medium flex items-center gap-2">
                <GraduationCap size={18} />
                年級
              </label>
              <div className="relative">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 appearance-none"
                >
                  <option value="">請選擇年級</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade} className="bg-slate-800">
                      {grade}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* 課程選擇 */}
            <div>
              <label className="block text-white mb-2 font-medium flex items-center gap-2">
                <BookOpen size={18} />
                課程
              </label>
              <div className="relative">
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 appearance-none"
                >
                  <option value="">請選擇課程</option>
                  {lessons.map((lesson) => (
                    <option key={lesson} value={lesson} className="bg-slate-800">
                      {lesson}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={fetchCharacters}
              disabled={!selectedVersion || !selectedGrade || !selectedLesson || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  載入中...
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  載入生字
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 生字預覽和下載 */}
        {characters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedVersion} {selectedGrade}下 {selectedLesson}
              </h2>
              <p className="text-gray-300">共 {characters.length} 個生字</p>
            </div>

            {/* 生字預覽 */}
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-6">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-white/5 border border-white/20 rounded p-2 text-center"
                >
                  <div className="text-white text-xl font-bold">{char.character}</div>
                  <div className="text-gray-400 text-xs">{char.pinyin}</div>
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

        {/* 使用說明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={20} />
            使用說明
          </h3>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>• <strong>選擇課程：</strong>依序選擇教材版本、年級和課程</p>
            <p>• <strong>載入生字：</strong>系統將從資料庫載入對應的生字資料</p>
            <p>• <strong>生成 PDF：</strong>自動產生包含九宮格的練習簿，每個字都有淡色輪廓和注音</p>
            <p>• <strong>列印練習：</strong>下載 PDF 後可直接列印，適合 A4 紙張</p>
            <p>• <strong>練習格式：</strong>每頁 18 個字，採用標準九宮格格式，包含注音和意思</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}