'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useForm } from 'react-hook-form';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { publishers, grades, semesters } from '@/constants/data';

export default function ArticlesManagementPage() {
  const { user, isAdmin, loading } = useAuth() || {};
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add');
  const [editingArticle, setEditingArticle] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    publisher: '',
    grade: '',
    semester: '',
    lesson: ''
  });

  // 監控表單值變化
  const watchedPublisher = watch('publisher');
  const watchedGrade = watch('grade');
  const watchedSemester = watch('semester');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }

    if (activeTab === 'manage') {
      fetchArticles();
    }
  }, [user, isAdmin, loading, router, activeTab]);

  // 獲取文章列表
  const fetchArticles = async (criteria = {}) => {
    setIsLoading(true);
    try {
      const articlesRef = collection(db, 'articles');
      let q = query(articlesRef, orderBy('createdAt', 'desc'));
      
      // 如果有篩選條件，添加where子句
      if (criteria.publisher) {
        q = query(articlesRef, where('publisher', '==', criteria.publisher), orderBy('createdAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedArticles = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 客戶端篩選其他條件
        if ((!criteria.grade || data.grade === parseInt(criteria.grade)) &&
            (!criteria.semester || data.semester === parseInt(criteria.semester)) &&
            (!criteria.lesson || data.lesson === parseInt(criteria.lesson))) {
          fetchedArticles.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('獲取文章錯誤:', error);
      alert('獲取文章失敗: ' + error.message);
    }
    setIsLoading(false);
  };

  // 提交文章
  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      const articleData = {
        title: data.title,
        content: data.content,
        publisher: data.publisher,
        grade: parseInt(data.grade),
        semester: parseInt(data.semester),
        lesson: parseInt(data.lesson),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingArticle) {
        // 更新現有文章
        await updateDoc(doc(db, 'articles', editingArticle.id), {
          ...articleData,
          updatedAt: new Date()
        });
        alert('文章更新成功！');
        setEditingArticle(null);
      } else {
        // 新增文章
        await addDoc(collection(db, 'articles'), articleData);
        alert('文章新增成功！');
      }
      
      reset();
      if (activeTab === 'manage') {
        fetchArticles(filterCriteria);
      }
    } catch (error) {
      console.error('儲存文章錯誤:', error);
      alert(`儲存失敗: ${error.message}`);
    }
    setFormLoading(false);
  };

  // 刪除文章
  const handleDeleteArticle = async (id) => {
    if (window.confirm('確定要刪除此文章嗎？')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        setArticles(articles.filter(article => article.id !== id));
        alert('文章已刪除');
      } catch (error) {
        console.error('刪除文章錯誤:', error);
        alert(`刪除失敗: ${error.message}`);
      }
    }
  };

  // 編輯文章
  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setValue('title', article.title);
    setValue('content', article.content);
    setValue('publisher', article.publisher);
    setValue('grade', article.grade);
    setValue('semester', article.semester);
    setValue('lesson', article.lesson);
    setActiveTab('add');
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingArticle(null);
    reset();
  };

  // 篩選文章
  const handleFilter = () => {
    fetchArticles(filterCriteria);
  };

  // 清除篩選
  const handleClearFilter = () => {
    setFilterCriteria({
      publisher: '',
      grade: '',
      semester: '',
      lesson: ''
    });
    fetchArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-indigo-100">
        <div className="loader">
          <div className="loader-dot bg-blue-400"></div>
          <div className="loader-dot bg-blue-400"></div>
          <div className="loader-dot bg-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          文章管理系統
        </h1>
        
        {/* 選項卡 */}
        <div className="bg-white rounded-t-3xl shadow-lg overflow-hidden mb-6">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('add');
                if (editingArticle) {
                  handleCancelEdit();
                }
              }}
              className={`flex-1 py-4 text-center font-bold transition ${
                activeTab === 'add' 
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {editingArticle ? '編輯文章' : '新增文章'}
            </button>
            <button
              onClick={() => {
                setActiveTab('manage');
                fetchArticles(filterCriteria);
              }}
              className={`flex-1 py-4 text-center font-bold transition ${
                activeTab === 'manage' 
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              管理文章
            </button>
          </div>
        </div>
        
        {/* 新增/編輯文章表單 */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            {editingArticle && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">正在編輯文章: {editingArticle.title}</span>
                  <button
                    onClick={handleCancelEdit}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    取消編輯
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出版社 *
                  </label>
                  <select
                    {...register('publisher', { required: '請選擇出版社' })}
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  >
                    <option value="">請選擇出版社</option>
                    {publishers.map(publisher => (
                      <option key={publisher} value={publisher}>{publisher}</option>
                    ))}
                  </select>
                  {errors.publisher && (
                    <p className="mt-1 text-xs text-red-500">{errors.publisher.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年級 *
                  </label>
                  <select
                    {...register('grade', { required: '請選擇年級' })}
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  >
                    <option value="">請選擇年級</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}年級</option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="mt-1 text-xs text-red-500">{errors.grade.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    學期 *
                  </label>
                  <select
                    {...register('semester', { required: '請選擇學期' })}
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  >
                    <option value="">請選擇學期</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>第{semester}學期</option>
                    ))}
                  </select>
                  {errors.semester && (
                    <p className="mt-1 text-xs text-red-500">{errors.semester.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    課次 *
                  </label>
                  <input
                    type="number"
                    {...register('lesson', { required: '請輸入課次', min: 1 })}
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    placeholder="第幾課"
                  />
                  {errors.lesson && (
                    <p className="mt-1 text-xs text-red-500">{errors.lesson.message}</p>
                  )}
                </div>
              </div>
              
              {/* 文章標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章標題 *
                </label>
                <input
                  type="text"
                  {...register('title', { required: '請輸入文章標題' })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  placeholder="請輸入文章標題"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              {/* 文章內容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章內容 *
                </label>
                <textarea
                  {...register('content', { required: '請輸入文章內容' })}
                  rows="12"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                  placeholder="請輸入文章內容..."
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
                )}
              </div>
              
              {/* 提交按鈕 */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition disabled:opacity-70"
                >
                  {formLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      處理中...
                    </div>
                  ) : (editingArticle ? '更新文章' : '新增文章')}
                </button>
                
                {editingArticle && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-full transition"
                  >
                    取消
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        
        {/* 管理文章列表 */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            {/* 篩選器 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">篩選條件</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <select
                  value={filterCriteria.publisher}
                  onChange={(e) => setFilterCriteria({...filterCriteria, publisher: e.target.value})}
                  className="px-3 py-2 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2"
                >
                  <option value="">所有出版社</option>
                  {publishers.map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
                  ))}
                </select>
                
                <select
                  value={filterCriteria.grade}
                  onChange={(e) => setFilterCriteria({...filterCriteria, grade: e.target.value})}
                  className="px-3 py-2 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2"
                >
                  <option value="">所有年級</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}年級</option>
                  ))}
                </select>
                
                <select
                  value={filterCriteria.semester}
                  onChange={(e) => setFilterCriteria({...filterCriteria, semester: e.target.value})}
                  className="px-3 py-2 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2"
                >
                  <option value="">所有學期</option>
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>第{semester}學期</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="課次"
                  value={filterCriteria.lesson}
                  onChange={(e) => setFilterCriteria({...filterCriteria, lesson: e.target.value})}
                  className="px-3 py-2 rounded-full border border-gray-300 focus:ring-blue-300 focus:outline-none focus:ring-2"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleFilter}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition"
                >
                  篩選
                </button>
                <button
                  onClick={handleClearFilter}
                  className="px-4 py-2 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition"
                >
                  清除
                </button>
              </div>
            </div>
            
            {/* 文章列表 */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">文章列表 ({articles.length})</h2>
              <button
                onClick={() => fetchArticles(filterCriteria)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition"
              >
                刷新
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="loader">
                  <div className="loader-dot bg-blue-400"></div>
                  <div className="loader-dot bg-blue-400"></div>
                  <div className="loader-dot bg-blue-400"></div>
                </div>
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {article.publisher}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {article.grade}年級
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            第{article.semester}學期
                          </span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            第{article.lesson}課
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                          {article.content.substring(0, 150)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          建立: {article.createdAt?.toDate?.()?.toLocaleDateString() || '未知'}
                          {article.updatedAt && article.updatedAt !== article.createdAt && 
                            ` | 更新: ${article.updatedAt?.toDate?.()?.toLocaleDateString() || '未知'}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                          title="編輯文章"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                          title="刪除文章"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">目前尚無文章數據</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}