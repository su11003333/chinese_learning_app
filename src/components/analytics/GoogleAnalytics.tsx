// src/components/analytics/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// 您的 Google Analytics 測量 ID
const GA_MEASUREMENT_ID = 'G-G8046EF0YL';

// TypeScript 聲明
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics 組件
export function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_location: window.location.href,
              page_title: document.title,
            });
          `,
        }}
      />
    </>
  );
}

// 追蹤頁面瀏覽的 Hook
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    
    // 確保 gtag 已載入
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_location: url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);
}

// 自定義事件追蹤函數
export const trackEvent = (eventName: string, eventData: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, {
    ...eventData,
    send_to: GA_MEASUREMENT_ID,
  });
};

// 學習相關的事件追蹤函數
export const trackCharacterLearning = (character: string, isCorrect: boolean = true) => {
  trackEvent('character_practice', {
    character: character,
    result: isCorrect ? 'correct' : 'incorrect',
    event_category: 'learning',
    event_label: `Character Practice: ${character}`
  });
};

export const trackLessonComplete = (lessonId: string, score?: number) => {
  trackEvent('lesson_complete', {
    lesson_id: lessonId,
    score: score,
    event_category: 'learning',
    event_label: `Lesson Complete: ${lessonId}`
  });
};

export const trackQuizResult = (quizType: string, score: number, totalQuestions: number) => {
  trackEvent('quiz_complete', {
    quiz_type: quizType,
    score: score,
    total_questions: totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    event_category: 'assessment',
    event_label: `Quiz Complete: ${quizType}`
  });
};

export const trackProgressCheck = (grade: string | number, charactersLearned: number) => {
  trackEvent('progress_check', {
    grade: grade,
    characters_learned: charactersLearned,
    event_category: 'progress',
    event_label: `Progress Check: Grade ${grade}`
  });
};

export const trackParentDashboard = (action: string, childName?: string) => {
  trackEvent('parent_dashboard', {
    action: action,
    child_name: childName,
    event_category: 'parent_engagement',
    event_label: `Parent Dashboard: ${action}`
  });
};

export const trackStudyTime = (duration: number, activityType: string) => {
  trackEvent('study_session', {
    duration_minutes: Math.round(duration / 60000), // 轉換為分鐘
    activity_type: activityType,
    event_category: 'engagement',
    event_label: `Study Session: ${activityType}`
  });
};

export const trackFeatureUsage = (featureName: string, details: Record<string, any> = {}) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    ...details,
    event_category: 'feature',
    event_label: `Feature Usage: ${featureName}`
  });
};

// 錯誤追蹤
export const trackError = (errorType: string, errorMessage: string, page?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    event_category: 'error',
    event_label: `Error: ${errorType}`
  });
};