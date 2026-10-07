'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface Contract {
  id: string;
  groomName: string;
  groomPhone: string;
  brideName: string;
  bridePhone: string;
  weddingDate: string;
  weddingVenue: string;
  weddingHall: string;
  weddingTime: string;
  customerEmail: string;
  snapPackage: string;
  shootingRequests: string;
  editingRequests: string;
  otherRequests: string;
  status: 'pending' | 'confirmed';
  submittedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin');
      return;
    }

    loadContracts();
  }, [router]);

  const loadContracts = async () => {
    try {
      // Firebase SDK 동적 로드
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');

      const firebaseConfig = {
        apiKey: 'AIzaSyBfgL7gC-uQeeH2bBB4q2JRTnk2ooRTZF8',
        authDomain: 'mkstroy-3dc7e.firebaseapp.com',
        projectId: 'mkstroy-3dc7e',
        storageBucket: 'mkstroy-3dc7e.firebasestorage.app',
        messagingSenderId: '1041941827601',
        appId: '1:1041941827601:web:4004c163fdd00586afa1b0',
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const contractsRef = collection(db, 'contracts');
      const q = query(contractsRef, orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const loadedContracts: Contract[] = [];
      querySnapshot.forEach((doc) => {
        loadedContracts.push({
          id: doc.id,
          ...doc.data(),
        } as Contract);
      });

      setContracts(loadedContracts);
      setFilteredContracts(loadedContracts);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = contracts.filter(
      (contract) =>
        contract.groomName.toLowerCase().includes(term) ||
        contract.brideName.toLowerCase().includes(term)
    );
    setFilteredContracts(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    router.push('/admin');
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardHeader}>
        <h1>📋 계약서 관리</h1>
        <div className={styles.headerActions}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.contractsSection}>
          <div className={styles.contractsHeader}>
            <h2>본식스냅 계약서 목록</h2>
            <div className={styles.contractsCount}>
              총 <span>{filteredContracts.length}</span>건
            </div>
          </div>

          <div className={styles.filterContainer}>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="신랑/신부 성함으로 검색..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                데이터를 불러오는 중입니다...
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>저장된 계약서가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>신랑</th>
                    <th style={{ width: '15%' }}>신부</th>
                    <th style={{ width: '18%' }}>본식 날짜</th>
                    <th style={{ width: '18%' }}>웨딩홀</th>
                    <th style={{ width: '15%' }}>시간</th>
                    <th style={{ width: '10%' }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className={styles.rowClick}
                      onClick={() => setSelectedContract(contract)}
                    >
                      <td>{contract.groomName || '-'}</td>
                      <td>{contract.brideName || '-'}</td>
                      <td>{contract.weddingDate || '-'}</td>
                      <td>
                        {contract.weddingVenue ? `${contract.weddingVenue} / ${contract.weddingHall || ''}` : '-'}
                      </td>
                      <td>{contract.weddingTime || '-'}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            contract.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                          }`}
                        >
                          {contract.status === 'confirmed' ? '확정' : '대기'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedContract && (
        <div className={styles.detailModal} onClick={() => setSelectedContract(null)}>
          <div className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <h3>계약서 상세 정보</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedContract(null)}>
                &times;
              </button>
            </div>
            <div className={styles.detailBody}>
              <DetailRow label="신랑 성함" value={selectedContract.groomName} />
              <DetailRow label="신랑 연락처" value={selectedContract.groomPhone} />
              <DetailRow label="신부 성함" value={selectedContract.brideName} />
              <DetailRow label="신부 연락처" value={selectedContract.bridePhone} />
              <DetailRow label="이메일" value={selectedContract.customerEmail} />
              <DetailRow label="본식 날짜" value={selectedContract.weddingDate} />
              <DetailRow label="예식장" value={selectedContract.weddingVenue} />
              <DetailRow label="홀 이름" value={selectedContract.weddingHall} />
              <DetailRow label="예식 시간" value={selectedContract.weddingTime} />
              <DetailRow label="상품구성" value={selectedContract.snapPackage} />
              <DetailRow label="촬영 요청사항" value={selectedContract.shootingRequests} />
              <DetailRow label="보정 요청사항" value={selectedContract.editingRequests} />
              <DetailRow label="기타 요청사항" value={selectedContract.otherRequests} />
              <DetailRow
                label="제출 시간"
                value={new Date(selectedContract.submittedAt).toLocaleString('ko-KR')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className={styles.detailRow}>
      <div className={styles.detailLabel}>{label}</div>
      <div className={styles.detailValue}>{value || '-'}</div>
    </div>
  );
}
