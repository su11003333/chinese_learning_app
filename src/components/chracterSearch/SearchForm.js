import React from 'react';
import { useForm } from 'react-hook-form';
import { publishers, grades, semesters, colorThemes } from '@/constants/data';

export function SearchForm({ onSubmit, onPublisherChange, selectedColor, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      publisher: publishers[0],
      grade: grades[0],
      semester: semesters[0],
      characters: ''
    }
  });

  const theme = colorThemes[selectedColor];

  const handlePublisherChange = (e) => {
    const publisher = e.target.value;
    onPublisherChange?.(publisher);
  };

  return (
    <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出版社
            </label>
            <select
              {...register('publisher', { required: '請選擇出版社' })}
              className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
              onChange={handlePublisherChange}
            >
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
              年級
            </label>
            <select
              {...register('grade', { required: '請選擇年級' })}
              className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
            >
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
              學期
            </label>
            <select
              {...register('semester', { required: '請選擇學期' })}
              className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>第{semester}學期</option>
              ))}
            </select>
            {errors.semester && (
              <p className="mt-1 text-xs text-red-500">{errors.semester.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            要查詢的字符
          </label>
          <input
            type="text"
            {...register('characters', { 
              required: '請輸入要查詢的字符',
              pattern: {
                value: /[\u4e00-\u9fff]/,
                message: '請輸入有效的中文字符'
              }
            })}
            className={`w-full px-4 py-3 rounded-full border border-gray-300 ${theme.input} focus:outline-none focus:ring-2 focus:border-transparent transition`}
            placeholder="例如：你我他"
          />
          {errors.characters && (
            <p className="mt-1 text-xs text-red-500">{errors.characters.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            輸入要查詢的中文字符，系統會檢查到指定年級學期為止是否已學過這些字
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 ${theme.button} text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition disabled:opacity-70`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              查詢中...
            </div>
          ) : '查詢累積生字'}
        </button>
      </form>
    </div>
  );
}