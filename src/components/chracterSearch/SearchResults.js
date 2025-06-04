import React from 'react';
import { colorThemes } from '@/constants/data';

export function SearchResults({ result, onClearResult, selectedColor }) {
  const theme = colorThemes[selectedColor];

  if (!result) {
    return null;
  }

  return (
    <div className={`${theme.card} rounded-3xl shadow-xl p-6 mb-8 transform transition duration-300 animate-float`}>
      {result.error ? (
        <ErrorView result={result} onClearResult={onClearResult} theme={theme} />
      ) : (
        <SuccessView result={result} onClearResult={onClearResult} theme={theme} />
      )}
    </div>
  );
}

function ErrorView({ result, onClearResult, theme }) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-red-200 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">查詢出現錯誤</h3>
      <p className="text-gray-600 mb-6">{result.message}</p>
      <button
        onClick={onClearResult}
        className={`px-6 py-2 ${theme.button} text-white rounded-full font-medium`}
      >
        重新查詢
      </button>
    </div>
  );
}

function SuccessView({ result, onClearResult, theme }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">查詢結果</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
        <p className="text-sm text-gray-600 text-center">
          查詢範圍：{result.publisher} 1年級上學期 ~ {result.grade}年級第{result.semester}學期
        </p>
        <p className="text-sm text-gray-600 text-center mt-1">
          結果：{result.totalLearned}/{result.totalQueried} 個字符已學過
        </p>
        <div className="flex justify-center items-center mt-2 space-x-4">
          <span className="text-xs text-gray-500">
            查詢時間：{result.queryTime}ms
          </span>
          {result.fromCache && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              快取命中
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {result.results.map((characterResult, index) => (
          <CharacterResultCard key={index} result={characterResult} />
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={onClearResult}
          className={`px-6 py-2 ${theme.button} text-white rounded-full font-medium`}
        >
          重新查詢
        </button>
      </div>
    </div>
  );
}

function CharacterResultCard({ result }) {
  return (
    <div className={`
      border-2 rounded-2xl p-4 text-center transition-all duration-200
      ${result.isLearned 
        ? 'border-green-300 bg-green-50' 
        : 'border-red-300 bg-red-50'
      }
    `}>
      <div className="text-4xl font-bold mb-2 text-gray-800">
        {result.character}
      </div>
      <div className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${result.isLearned
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
        }
      `}>
        {result.isLearned ? (
          <>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            已學過
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            尚未學過
          </>
        )}
      </div>
    </div>
  );
}