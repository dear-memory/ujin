'use client';

import dynamic from 'next/dynamic';

// Firebase 로그인과 pdf.js는 브라우저에서만 동작하므로 서버 렌더링을 끕니다.
const CalendarApp = dynamic(() => import('./CalendarApp'), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>불러오는 중…</p>,
});

export default function CalendarPage() {
  return <CalendarApp />;
}
