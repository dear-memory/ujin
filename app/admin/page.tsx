'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      if (isLoggedIn) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (password === 'dearmemory2024') {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      router.push('/dashboard');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginHeader}>
        <h1>관리자 로그인</h1>
        <p>본식스냅 계약서 관리</p>
        <div className={styles.apertureDivider}>
          <span className={styles.line}></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#93712f" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9"/>
            <polygon points="12,5 17,9 15,16 9,16 7,9" strokeLinejoin="round"/>
          </svg>
          <span className={styles.line}></span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="password">관리자 비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            비밀번호가 올바르지 않습니다.
          </div>
        )}

        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>
      </form>

      <div className={styles.backLink}>
        <a href="/">← 돌아가기</a>
      </div>
    </div>
  );
}
