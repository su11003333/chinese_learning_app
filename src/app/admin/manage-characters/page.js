// src/app/admin/manage-characters/page.js
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageCharacters() {
  // 狀態管理
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('pink');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 篩選條件
  const [filters, setFilters] = useState({
    publisher: '',
    grade: '',
    semester: '',
    searchTerm: '',
  });
  
  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    character: '',
    zhuyin: '',
    lessons: [],
    examples: '',
    strokeCount: 0
  });
  
  const router = useRouter();
  const auth = useAuth();

  // 預設值
  const publishers = ['康軒', '南一', '翰林'];
  const grades = [1, 2, 3, 4, 5, 6];
  const semesters = [1, 2];
  const pageSizeOptions = [10, 20, 50, 100];

  // 顏色主題設定
  const colorThemes = {
    pink: {
      bg: 'bg-gradient-to-r from-pink-50 to-purple-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
      input: 'focus:ring-pink-300',
      title: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-50 to-green-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500',
      input: 'focus:ring-blue-300',
      title: 'bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent',
    },
    yellow: {
      bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
      card: 'bg-white',
      button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
      input: 'focus:ring-yellow-300',
      title: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent',
    }
  };

  const theme = colorThemes[selectedColor];

  // 初次載入時獲取所有字符
  useEffect(() => {
    if (auth && !auth.loading) {
      fetchAllCharacters();
    }
  }, [auth]);

  // 根據篩選條件更新字符列表
  useEffect(() => {
    if (characters.length > 0) {
      filterCharacters();
    }
  }, [filters, characters]);

  // 處理出版社選擇時的顏色變更
  const handlePublisherChange = (publisher) => {
    setFilters(prev => ({ ...prev, publisher }));
    if (publisher === '康軒') setSelectedColor('pink');
    else if (publisher === '南一') setSelectedColor('blue');
    else if (publisher === '翰林') setSelectedColor('yellow');
    else setSelectedColor('pink'); // 默認顏色
  };

  // 獲取所有字符
  const fetchAllCharacters = async () => {
    setLoading(true);
    try {
      const charactersRef = collection(db, "characters");
      const querySnapshot = await getDocs(charactersRef);
      
      const fetchedCharacters = [];
      querySnapshot.forEach((doc) => {
        fetchedCharacters.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCharacters(fetchedCharacters);
      setFilteredCharacters(fetchedCharacters);
    } catch (error) {
      console.error("獲取字符錯誤:", error);
      setMessage({ 
        type: 'error', 
        content: '獲取字符資料時發生錯誤，請稍後再試。' 
      });
    }
    setLoading(false);
  };

  // 根據條件篩選字符
  const filterCharacters = () => {
    let result = [...characters];
    
    // 根據關鍵字搜尋
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(char => 
        char.character.includes(term) || 
        (char.zhuyin && char.zhuyin.includes(term))
      );
    }
    
    // 根據出版社、年級、學期篩選
    if (filters.publisher || filters.grade || filters.semester) {
      result = result.filter(char => {
        // 檢查字符的lessons數組中是否有符合條件的課程
        return char.lessons && char.lessons.some(lesson => {
          const parts = lesson.split('_');
          const lessonPublisher = parts[0];
          const lessonGrade = parseInt(parts[1]);
          const lessonSemester = parseInt(parts[2]);
          
          return (!filters.publisher || lessonPublisher === filters.publisher) && 
                 (!filters.grade || lessonGrade === parseInt(filters.grade)) && 
                 (!filters.semester || lessonSemester === parseInt(filters.semester));
        });
      });
    }
    
    setFilteredCharacters(result);
    setCurrentPage(1); // 重置為第一頁
  };

  // 獲取當前頁的數據
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCharacters.slice(startIndex, endIndex);
  };

  // 計算總頁數
  const totalPages = Math.ceil(filteredCharacters.length / pageSize);

  // 選擇字符查看詳情
  const selectCharacter = async (char) => {
    setLoading(true);
    try {
      // 獲取最新的字符數據
      const charRef = doc(db, "characters", char.id);
      const charDoc = await getDoc(charRef);
      
      if (charDoc.exists()) {
        const charData = charDoc.data();
        setSelectedCharacter({
          id: charDoc.id,
          ...charData
        });
        
        // 初始化編輯表單數據
        setEditForm({
          character: charData.character || '',
          zhuyin: charData.zhuyin || '',
          lessons: charData.lessons || [],
          examples: charData.examples ? charData.examples.join('\n') : '',
          strokeCount: charData.strokeCount || 0
        });
      } else {
        setMessage({ 
          type: 'error', 
          content: '無法找到此字符的詳細資料。' 
        });
      }
    } catch (error) {
      console.error("獲取字符詳情錯誤:", error);
      setMessage({ 
        type: 'error', 
        content: '獲取字符詳情時發生錯誤。' 
      });
    }
    setLoading(false);
    setIsEditing(false);
  };

  // 更新字符數據
  const updateCharacter = async () => {
    setLoading(true);
    try {
      const charRef = doc(db, "characters", selectedCharacter.id);
      
      // 處理例句
      const examples = editForm.examples.trim() 
        ? editForm.examples.split('\n').filter(ex => ex.trim() !== '')
        : [];
      
      // 準備更新數據
      const updatedData = {
        character: editForm.character,
        zhuyin: editForm.zhuyin,
        lessons: editForm.lessons,
        examples: examples,
        strokeCount: parseInt(editForm.strokeCount) || 0,
        updatedAt: new Date().toISOString()
      };
      
      // 更新文檔
      await updateDoc(charRef, updatedData);
      
      // 更新本地數據
      setSelectedCharacter({
        ...selectedCharacter,
        ...updatedData
      });
      
      // 更新字符列表中的數據
      setCharacters(prevChars => prevChars.map(char => 
        char.id === selectedCharacter.id ? { ...char, ...updatedData } : char
      ));
      
      setMessage({ 
        type: 'success', 
        content: `字符 "${editForm.character}" 更新成功！` 
      });
      setIsEditing(false);
    } catch (error) {
      console.error("更新字符錯誤:", error);
      setMessage({ 
        type: 'error', 
        content: '更新字符時發生錯誤。' 
      });
    }
    setLoading(false);
  };

  // 刪除字符
  const deleteCharacter = async () => {
    if (!window.confirm(`確定要刪除字符 "${selectedCharacter.character}" 嗎？此操作無法撤銷。`)) {
      return;
    }
    
    setLoading(true);
    try {
      // 從 characters 集合中刪除
      await deleteDoc(doc(db, "characters", selectedCharacter.id));
      
      // 從 lessons 集合中相關課程移除此字符
      for (const lessonId of selectedCharacter.lessons || []) {
        try {
          const lessonRef = doc(db, "lessons", lessonId);
          const lessonDoc = await getDoc(lessonRef);
          
          if (lessonDoc.exists()) {
            const lessonData = lessonDoc.data();
            const updatedCharacters = lessonData.characters.filter(
              char => char.character !== selectedCharacter.character
            );
            
            await updateDoc(lessonRef, { 
              characters: updatedCharacters,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`從課程 ${lessonId} 中移除字符時發生錯誤:`, error);
        }
      }
      
      // 更新本地數據
      setCharacters(prevChars => prevChars.filter(char => char.id !== selectedCharacter.id));
      setFilteredCharacters(prevChars => prevChars.filter(char => char.id !== selectedCharacter.id));
      setSelectedCharacter(null);
      
      setMessage({ 
        type: 'success', 
        content: `字符 "${selectedCharacter.character}" 已成功刪除！` 
      });
    } catch (error) {
      console.error("刪除字符錯誤:", error);
      setMessage({ 
        type: 'error', 
        content: '刪除字符時發生錯誤。' 
      });
    }
    setLoading(false);
  };

  // 取消編輯
  const cancelEdit = () => {
    setIsEditing(false);
    // 重置編輯表單為原始數據
    if (selectedCharacter) {
      setEditForm({
        character: selectedCharacter.character || '',
        zhuyin: selectedCharacter.zhuyin || '',
        lessons: selectedCharacter.lessons || [],
        examples: selectedCharacter.examples ? selectedCharacter.examples.join('\n') : '',
        strokeCount: selectedCharacter.strokeCount || 0
      });
    }
  };

  // 編輯表單處理
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 移除課程關聯
  const removeLesson = (lessonToRemove) => {
    setEditForm(prev => ({
      ...prev,
      lessons: prev.lessons.filter(lesson => lesson !== lessonToRemove)
    }));
  };

  // 關閉資料面板
  const closeCharacterPanel = () => {
    setSelectedCharacter(null);
    setIsEditing(false);
  };

  // 分頁處理
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 輸入樣式
  const inputStyle = `w-full px-4 py-2 text-gray-800 placeholder-gray-500 border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`;

  // 計算分頁按鈕
  const getPageButtons = () => {
    const buttons = [];
    const maxButtons = 5; // 最多顯示的按鈕數
    
    // 總是顯示第一頁
    buttons.push(
      <button 
        key="page-1"
        onClick={() => goToPage(1)}
        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
      >
        1
      </button>
    );
    
    // 如果總頁數大於最大按鈕數，添加省略號
    if (totalPages > maxButtons) {
      // 當前頁靠近開始
      if (currentPage <= 3) {
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
          buttons.push(
            <button 
              key={`page-${i}`}
              onClick={() => goToPage(i)}
              className={`px-3 py-1 rounded ${currentPage === i ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
            >
              {i}
            </button>
          );
        }
        if (totalPages > 4) {
          buttons.push(<span key="ellipsis1" className="px-2">...</span>);
        }
      } 
      // 當前頁靠近結束
      else if (currentPage >= totalPages - 2) {
        if (totalPages > 4) {
          buttons.push(<span key="ellipsis1" className="px-2">...</span>);
        }
        for (let i = Math.max(2, totalPages - 3); i <= totalPages - 1; i++) {
          buttons.push(
            <button 
              key={`page-${i}`}
              onClick={() => goToPage(i)}
              className={`px-3 py-1 rounded ${currentPage === i ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
            >
              {i}
            </button>
          );
        }
      } 
      // 當前頁在中間
      else {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          if (i > 1 && i < totalPages) {
            buttons.push(
              <button 
                key={`page-${i}`}
                onClick={() => goToPage(i)}
                className={`px-3 py-1 rounded ${currentPage === i ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
              >
                {i}
              </button>
            );
          }
        }
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
    } else {
      // 如果總頁數小於等於最大按鈕數，顯示所有頁碼
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <button 
            key={`page-${i}`}
            onClick={() => goToPage(i)}
            className={`px-3 py-1 rounded ${currentPage === i ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
          >
            {i}
          </button>
        );
      }
    }
    
    // 如果有多頁，總是顯示最後一頁
    if (totalPages > 1) {
      buttons.push(
        <button 
          key={`page-${totalPages}`}
          onClick={() => goToPage(totalPages)}
          className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  // 加載中顯示
  if (!auth || auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="animate-bounce p-6 bg-white rounded-full">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  // 獲取當前頁的數據
  const currentPageData = getCurrentPageData();

  return (
    <div className={`min-h-screen py-6 px-4 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme.title}`}>
          漢字管理
        </h1>
        
        {/* 頂部操作欄 */}
        <div className="mb-4 flex justify-between items-center">
          <Link 
            href="/admin/add-characters" 
            className={`${theme.button} text-white px-4 py-2 rounded-full shadow-md`}
          >
            新增漢字
          </Link>
          
          {/* 分頁大小選擇 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">每頁顯示:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // 重置到第一頁
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 篩選區域 */}
        <div className={`${theme.card} rounded-xl shadow-md p-4 mb-4`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜尋框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜尋字符/注音
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className={`${inputStyle} rounded-lg`}
                placeholder="輸入字或注音..."
              />
            </div>
            
            {/* 出版社篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出版社
              </label>
              <select
                value={filters.publisher}
                onChange={(e) => handlePublisherChange(e.target.value)}
                className={`${inputStyle} rounded-lg`}
              >
                <option value="">全部</option>
                {publishers.map(publisher => (
                  <option key={publisher} value={publisher}>{publisher}</option>
                ))}
              </select>
            </div>
            
            {/* 年級篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年級
              </label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                className={`${inputStyle} rounded-lg`}
              >
                <option value="">全部</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}年級</option>
                ))}
              </select>
            </div>
            
            {/* 學期篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學期
              </label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className={`${inputStyle} rounded-lg`}
              >
                <option value="">全部</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>第{semester}學期</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* 顯示消息 */}
        {message.content && (
          <div className={`rounded-lg p-3 mb-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p>{message.content}</p>
          </div>
        )}
        
        {/* 主內容區 - 使用Flex */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* 字符列表 */}
          <div className={`${theme.card} rounded-xl shadow-md p-4 w-full ${selectedCharacter ? 'md:w-2/3' : 'md:w-full'}`}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">字符列表</h2>
              <span className="text-sm text-gray-500">
                共 {filteredCharacters.length} 個字符，顯示 {Math.min(pageSize, filteredCharacters.length)} 個
              </span>
            </div>
            
            {loading && filteredCharacters.length === 0 ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-pink-500"></div>
              </div>
            ) : filteredCharacters.length > 0 ? (
              <>
                {/* 字符表格 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          字符
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注音
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          所在課程
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentPageData.map((char, index) => (
                        <tr key={char.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xl font-bold text-gray-900">{char.character}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{char.zhuyin || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {char.lessons && char.lessons.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {char.lessons.slice(0, 3).map((lesson, idx) => {
                                    const parts = lesson.split('_');
                                    return (
                                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                                        {parts[0]} {parts[1]}年{parts[2]}期
                                      </span>
                                    );
                                  })}
                                  {char.lessons.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                                      +{char.lessons.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">無關聯課程</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => selectCharacter(char)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              查看
                            </button>
                            <button
                              onClick={() => {
                                selectCharacter(char);
                                setTimeout(() => setIsEditing(true), 100);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              編輯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* 分頁控制 */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    顯示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredCharacters.length)} 筆，共 {filteredCharacters.length} 筆
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                      上一頁
                    </button>
                    {getPageButtons()}
                    <button 
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                      下一頁
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-500">
                沒有找到符合條件的字符
              </div>
            )}
          </div>
          
          {/* 字符詳情面板 - 條件渲染 */}
          {selectedCharacter && (
            <div className={`${theme.card} rounded-xl shadow-md p-4 w-full md:w-1/3`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  {isEditing ? '編輯字符' : '字符詳情'}
                </h2>
                <button 
                  onClick={closeCharacterPanel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  {/* 編輯表單 */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          字符
                        </label>
                        <input
                          type="text"
                          name="character"
                          value={editForm.character}
                          onChange={handleFormChange}
                          maxLength={1}
                          className={`${inputStyle} rounded-lg text-xl font-bold text-center`}
                        />
                      </div>
                      <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                         注音
                       </label>
                       <input
                         type="text"
                         name="zhuyin"
                         value={editForm.zhuyin}
                         onChange={handleFormChange}
                         className={`${inputStyle} rounded-lg`}
                       />
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       筆畫數
                     </label>
                     <input
                       type="number"
                       name="strokeCount"
                       value={editForm.strokeCount}
                       onChange={handleFormChange}
                       min="0"
                       className={`${inputStyle} rounded-lg w-32`}
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       例句 (每行一句)
                     </label>
                     <textarea
                       name="examples"
                       value={editForm.examples}
                       onChange={handleFormChange}
                       rows="4"
                       className={`${inputStyle} rounded-lg`}
                       placeholder="請輸入例句，每行一句"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       關聯課程
                     </label>
                     <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                       {editForm.lessons && editForm.lessons.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                           {editForm.lessons.map(lesson => {
                             const parts = lesson.split('_');
                             return (
                               <div key={lesson} className="flex items-center bg-white px-3 py-1 rounded-full border border-gray-200">
                                 <span className="text-sm">
                                   {parts[0]} {parts[1]}年級 {parts[2]}期 {parts[3]}課
                                 </span>
                                 <button
                                   type="button"
                                   onClick={() => removeLesson(lesson)}
                                   className="ml-2 text-gray-400 hover:text-red-500"
                                 >
                                   &times;
                                 </button>
                               </div>
                             );
                           })}
                         </div>
                       ) : (
                         <p className="text-gray-500 text-center py-2">無關聯課程</p>
                       )}
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex justify-end space-x-2 mt-4">
                   <button
                     type="button"
                     onClick={cancelEdit}
                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                   >
                     取消
                   </button>
                   <button
                     type="button"
                     onClick={updateCharacter}
                     disabled={loading}
                     className={`px-4 py-2 ${theme.button} rounded-lg text-white`}
                   >
                     {loading ? '儲存中...' : '儲存變更'}
                   </button>
                 </div>
               </div>
             ) : (
               <div className="space-y-4">
                 {/* 字符詳情 */}
                 <div className="flex justify-center mb-4">
                   <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                     <span className="text-4xl font-bold">{selectedCharacter.character}</span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="text-xs text-gray-500 mb-1">注音</div>
                     <div className="font-medium">{selectedCharacter.zhuyin || '-'}</div>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="text-xs text-gray-500 mb-1">筆畫數</div>
                     <div className="font-medium">{selectedCharacter.strokeCount || '0'}</div>
                   </div>
                 </div>
                 
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <div className="text-xs text-gray-500 mb-1">例句</div>
                   {selectedCharacter.examples && selectedCharacter.examples.length > 0 ? (
                     <ul className="list-disc list-inside text-sm space-y-1">
                       {selectedCharacter.examples.map((example, index) => (
                         <li key={index}>{example}</li>
                       ))}
                     </ul>
                   ) : (
                     <div className="text-gray-400">無例句</div>
                   )}
                 </div>
                 
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <div className="text-xs text-gray-500 mb-1">所在課程</div>
                   {selectedCharacter.lessons && selectedCharacter.lessons.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {selectedCharacter.lessons.map((lesson, index) => {
                         const parts = lesson.split('_');
                         return (
                           <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200">
                             {parts[0]} {parts[1]}年級{parts[2]}期 第{parts[3]}課
                           </span>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="text-gray-400">無關聯課程</div>
                   )}
                 </div>
                 
                 <div className="flex justify-between mt-4">
                   <div className="text-xs text-gray-500">
                     最後更新: {new Date(selectedCharacter.updatedAt || Date.now()).toLocaleString()}
                   </div>
                   <div className="space-x-2">
                     <button
                       onClick={() => setIsEditing(true)}
                       className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                     >
                       編輯
                     </button>
                     <button
                       onClick={deleteCharacter}
                       className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                     >
                       刪除
                     </button>
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}
       </div>
     </div>
   </div>
 );
}