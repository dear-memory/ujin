'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
import type { User } from 'firebase/auth';
import styles from './calendar.module.css';
import {
  auth,
  onAuthStateChanged,
  signIn,
  logOut,
  getDriveToken,
  getDriveEmail,
  reconnectDrive,
  authErrorMessage,
  clearDriveToken,
} from '@/lib/calendar/firebase';
import { listContractFiles, downloadFile, DriveAuthError, DriveSetupError } from '@/lib/calendar/drive';
import { parseContract, bookingTitle, PARSER_VERSION } from '@/lib/calendar/parseContract';
import { loadBookings, saveParsed, saveOverrides, effective } from '@/lib/calendar/store';

type Booking = {
  date?: string;
  time?: string;
  dateSource?: string;
  groom?: string;
  bride?: string;
  venue?: string;
  product?: string;
  memo?: string;
  total?: number;
  deposit?: number;
  balance?: number;
  phones?: string[];
};

type BookingRecord = {
  fileName: string;
  modifiedTime: string;
  webViewLink?: string | null;
  parsed?: Booking;
  overrides?: Partial<Record<EditableKey, string>>;
  textLength?: number;
  parserVersion?: number;
};

const EDITABLE = ['date', 'time', 'groom', 'bride', 'venue', 'product', 'memo'] as const;
type EditableKey = (typeof EDITABLE)[number];

const FIELD_LABELS: Record<EditableKey, string> = {
  date: '촬영일',
  time: '시간',
  groom: '신랑',
  bride: '신부',
  venue: '예식장',
  product: '상품',
  memo: '메모',
};

const SOURCE_TEXT: Record<string, string> = {
  label: '계약서의 본식 날짜 항목에서 날짜를 찾았습니다.',
  'label-no-year': '본식 날짜에 연도가 없어 계약서를 만든 날 이후 가장 가까운 해로 넣었습니다. 맞는지 확인해 주세요.',
};

const won = (n?: number) => (n ? `${n.toLocaleString('ko-KR')}원` : '');

function addHours(time: string, hours: number) {
  const [h, m] = time.split(':').map(Number);
  return `${String(Math.min(h + hours, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function CalendarApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [records, setRecords] = useState<Map<string, BookingRecord>>(new Map());
  const [liveIds, setLiveIds] = useState<Set<string> | null>(null);
  const [status, setStatus] = useState('');
  const [needsDrive, setNeedsDrive] = useState(false);
  // 배너에 띄울 Drive 관련 안내 (만료, 권한 없음, API 꺼짐 등)
  const [driveNotice, setDriveNotice] = useState('');
  const [driveEmail, setDriveEmail] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  // 이번 불러오기에서 읽지 못한 파일과 그 이유
  const [failures, setFailures] = useState<{ id: string; name: string; link?: string; error: string }[]>([]);
  const syncingRef = useRef(false);

  const visible = useMemo(
    () =>
      [...records.entries()]
        .filter(([id]) => !liveIds || liveIds.has(id))
        .map(([id, record]) => ({ id, record, b: { ...(effective(record) as Booking), fileName: record.fileName } })),
    [records, liveIds],
  );

  const events = useMemo(
    () =>
      visible
        .filter(({ b }) => b.date)
        .map(({ id, b }) => ({
          id,
          title: b.venue ? `${bookingTitle(b)} · ${b.venue}` : bookingTitle(b),
          start: b.time ? `${b.date}T${b.time}` : b.date,
          end: b.time ? `${b.date}T${addHours(b.time, 2)}` : undefined,
          allDay: !b.time,
        })),
    [visible],
  );

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const upcoming = visible
    .filter(({ b }) => b.date && b.date >= today)
    .sort((a, z) => (a.b.date + (a.b.time || '')).localeCompare(z.b.date + (z.b.time || '')))
    .slice(0, 8);
  const unparsed = visible.filter(({ b }) => !b.date);

  const sync = useCallback(async (u: User) => {
    if (syncingRef.current) return;
    const token = getDriveToken();
    setDriveEmail(getDriveEmail());
    if (!token) {
      setNeedsDrive(true);
      setDriveNotice('Drive 연결이 만료되었습니다. 새 계약서를 불러오려면 다시 연결해 주세요.');
      return;
    }
    setDriveNotice('');
    syncingRef.current = true;
    setSyncing(true);
    try {
      setStatus('Drive에서 계약서를 찾는 중…');
      const files = await listContractFiles(token);
      setLiveIds(new Set(files.map((f) => f.id)));
      const known = await loadBookings(u.uid);
      // 새 파일, 수정된 파일, 예전 규칙으로 분석한 파일을 다시 분석합니다.
      const todo = files.filter((f) => {
        const r = known.get(f.id);
        return !r || r.modifiedTime !== f.modifiedTime || r.parserVersion !== PARSER_VERSION;
      });
      const total = todo.length;
      let done = 0;
      let failed = 0;
      setFailures([]);
      // pdf.js는 무거워서 실제로 분석할 때만 불러옵니다.
      const { extractText } = total ? await import('@/lib/calendar/pdfText') : { extractText: null };
      const worker = async () => {
        while (todo.length) {
          const file = todo.shift();
          try {
            const bytes = await downloadFile(file.id, token);
            const text = await extractText(bytes, {
              onOcr: (p: number, n: number) => setStatus(`계약서 분석 중 ${done + 1}/${total} · 이미지 글자 인식 ${p}/${n}쪽`),
            });
            const parsed = parseContract(text, file.name, file.createdTime || file.modifiedTime);
            await saveParsed(u.uid, file, parsed, text.length);
            setRecords((prev) => {
              const next = new Map(prev);
              next.set(file.id, {
                ...(prev.get(file.id) || {}),
                fileName: file.name,
                modifiedTime: file.modifiedTime,
                webViewLink: file.webViewLink,
                parsed,
                parserVersion: PARSER_VERSION,
                textLength: text.length,
              });
              return next;
            });
          } catch (e) {
            if (e instanceof DriveAuthError || e instanceof DriveSetupError) throw e;
            failed++;
            console.error(file.name, e);
            const error = (e as Error)?.message || String(e);
            setFailures((prev) => [...prev, { id: file.id, name: file.name, link: file.webViewLink, error }]);
          }
          done++;
          setStatus(`계약서 분석 중 ${done}/${total}`);
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      setStatus(`계약서 ${files.length}건${failed ? `, 읽기 실패 ${failed}건` : ''} · ${time} 기준`);
    } catch (e) {
      if (e instanceof DriveAuthError) {
        clearDriveToken();
        setNeedsDrive(true);
        setDriveNotice(e.message);
        setStatus('');
      } else if (e instanceof DriveSetupError) {
        setDriveNotice(e.message);
        setStatus('');
      } else {
        setStatus(`불러오기 실패: ${(e as Error).message}`);
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setRecords(new Map());
        setLiveIds(null);
        if (!u) return;
        setStatus('저장된 일정을 불러오는 중…');
        try {
          setRecords(await loadBookings(u.uid));
          setStatus('');
        } catch (e) {
          setStatus(`저장된 일정을 불러오지 못했습니다: ${(e as Error).message}`);
        }
        sync(u);
      }),
    [sync],
  );

  const handleLogin = async () => {
    setLoginError('');
    try {
      await signIn();
    } catch (e) {
      setLoginError(`로그인하지 못했습니다. ${authErrorMessage(e)}`);
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnectDrive();
      setNeedsDrive(false);
      setDriveNotice('');
      setDriveEmail(getDriveEmail());
      if (user) sync(user);
    } catch (e) {
      setDriveNotice(`Drive를 연결하지 못했습니다. ${authErrorMessage(e)}`);
    }
  };

  const handleSave = async (id: string, values: Record<EditableKey, string>) => {
    const record = records.get(id);
    if (!record || !user) return;
    const parsed = record.parsed || {};
    // 자동 분석 값과 다른 칸만 수정값으로 저장합니다.
    const overrides = { ...(record.overrides || {}) };
    for (const k of EDITABLE) {
      const v = values[k].trim();
      if (v === String(parsed[k] ?? '')) delete overrides[k];
      else overrides[k] = v;
    }
    setRecords((prev) => new Map(prev).set(id, { ...record, overrides }));
    setOpenId(null);
    try {
      await saveOverrides(user.uid, id, overrides);
      setStatus('저장했습니다.');
    } catch (e) {
      setStatus(`저장 실패: ${(e as Error).message}`);
    }
  };

  if (user === undefined) return <p className={styles.loadingText}>불러오는 중…</p>;

  if (!user) {
    return (
      <div className={styles.center}>
        <div className={styles.loginCard}>
          <h1>디어메모리 예약 캘린더</h1>
          <p className={styles.muted}>
            Google 계정으로 로그인하면 Drive에서 이름이 <b>DM</b>으로 시작하는 계약서 PDF를 읽어 촬영 일정을
            캘린더에 표시합니다.
          </p>
          <button className={styles.primaryBtn} onClick={handleLogin}>
            Google 계정으로 로그인
          </button>
          {loginError && <p className={styles.error}>{loginError}</p>}
        </div>
      </div>
    );
  }

  const openRecord = openId ? records.get(openId) : null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>예약 캘린더</h1>
        <div className={styles.headerActions}>
          <span className={styles.muted}>{status}</span>
          <button className={styles.btn} disabled={syncing} onClick={() => sync(user)}>
            계약서 다시 불러오기
          </button>
          <span className={styles.muted}>
            {user.email}
            {driveEmail && driveEmail !== user.email && ` · Drive: ${driveEmail}`}
          </span>
          <button className={styles.ghostBtn} onClick={handleReconnect}>
            Drive 계정 바꾸기
          </button>
          <button className={styles.ghostBtn} onClick={() => logOut()}>
            로그아웃
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {driveNotice && (
          <div className={styles.banner}>
            {driveNotice}
            {needsDrive ? (
              <button className={styles.primaryBtn} onClick={handleReconnect}>
                Drive 다시 연결
              </button>
            ) : (
              <button className={styles.btn} disabled={syncing} onClick={() => sync(user)}>
                다시 시도
              </button>
            )}
          </div>
        )}
        <div className={styles.layout}>
          <div className={styles.calendarBox}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              locale={koLocale}
              initialView={typeof window !== 'undefined' && window.innerWidth < 700 ? 'listMonth' : 'dayGridMonth'}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listMonth' }}
              height="auto"
              dayMaxEvents={4}
              events={events}
              eventClick={(info) => setOpenId(info.event.id)}
            />
          </div>
          <aside className={styles.side}>
            <h3>다가오는 촬영</h3>
            <ItemList
              items={upcoming}
              label={({ b }) => `${b.date.slice(5).replace('-', '/')} ${b.time || ''} ${bookingTitle(b)}`}
              empty="예정된 촬영이 없습니다."
              onOpen={setOpenId}
            />
            <h3>
              확인이 필요한 계약서 {unparsed.length > 0 && <span className={styles.pill}>{unparsed.length}</span>}
            </h3>
            <p className={styles.small}>날짜를 찾지 못했습니다. 눌러서 직접 입력해 주세요.</p>
            <ItemList items={unparsed} label={({ record }) => record.fileName} empty="모두 확인되었습니다." onOpen={setOpenId} />
            {failures.length > 0 && (
              <>
                <h3>
                  읽지 못한 계약서 <span className={styles.pill}>{failures.length}</span>
                </h3>
                <ul className={styles.list}>
                  {failures.map((f) => (
                    <li key={f.id}>
                      <a href={f.link || `https://drive.google.com/file/d/${f.id}/view`} target="_blank" rel="noopener noreferrer">
                        {f.name}
                      </a>
                      <div className={styles.small}>{f.error}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </main>

      {openId && openRecord && (
        <DetailDialog
          key={openId}
          id={openId}
          record={openRecord}
          onClose={() => setOpenId(null)}
          onSave={handleSave}
          loadText={loadText}
        />
      )}
    </div>
  );
}

type Item = { id: string; record: BookingRecord; b: Booking & { fileName: string } };

function ItemList({
  items,
  label,
  empty,
  onOpen,
}: {
  items: Item[];
  label: (item: Item) => string;
  empty: string;
  onOpen: (id: string) => void;
}) {
  if (!items.length) return <p className={styles.small}>{empty}</p>;
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <button className={styles.linkBtn} onClick={() => onOpen(item.id)}>
            {label(item)}
          </button>
        </li>
      ))}
    </ul>
  );
}

// 계약서 PDF에서 실제로 읽힌 글을 다시 꺼내 보여 줍니다. 날짜를 잘못 읽을 때 원인을 보기 위한 것입니다.
async function loadText(id: string) {
  const token = getDriveToken();
  if (!token) throw new Error('Drive 연결이 만료되었습니다. Drive를 다시 연결해 주세요.');
  const { extractText } = await import('@/lib/calendar/pdfText');
  return extractText(await downloadFile(id, token));
}

function DetailDialog({
  id,
  record,
  onClose,
  onSave,
  loadText,
}: {
  id: string;
  record: BookingRecord;
  onClose: () => void;
  onSave: (id: string, values: Record<EditableKey, string>) => void;
  loadText: (id: string) => Promise<string>;
}) {
  const [rawText, setRawText] = useState<string | null>(null);
  const [rawState, setRawState] = useState('');
  const b = effective(record) as Booking;
  const [values, setValues] = useState(
    () => Object.fromEntries(EDITABLE.map((k) => [k, String(b[k] ?? '')])) as Record<EditableKey, string>,
  );
  const edited = record.overrides && Object.keys(record.overrides).length > 0;
  const source = edited
    ? '직접 수정한 값이 있습니다.'
    : record.textLength === 0
      ? 'PDF에서 글자를 읽지 못했습니다 (스캔본일 수 있습니다). 직접 입력해 주세요.'
      : SOURCE_TEXT[b.dateSource] || '날짜를 찾지 못했습니다. 직접 입력해 주세요.';
  const extra = [
    ['연락처', (b.phones || []).join(', ')],
    ['총액', won(b.total)],
    ['계약금', won(b.deposit)],
    ['잔금', won(b.balance)],
  ].filter(([, v]) => v);

  return (
    <div className={styles.modal} onClick={onClose}>
      <form
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(id, values);
        }}
      >
        <h2>{bookingTitle({ ...b, fileName: record.fileName })}</h2>
        <a href={record.webViewLink || `https://drive.google.com/file/d/${id}/view`} target="_blank" rel="noopener noreferrer">
          {record.fileName} 열기
        </a>
        <p className={styles.small}>{source}</p>
        <div className={styles.grid}>
          {EDITABLE.map((k) => (
            <label key={k} className={['venue', 'product', 'memo'].includes(k) ? styles.wide : undefined}>
              {FIELD_LABELS[k]}
              {k === 'memo' ? (
                <textarea rows={3} value={values[k]} onChange={(e) => setValues({ ...values, [k]: e.target.value })} />
              ) : (
                <input
                  type={k === 'date' ? 'date' : k === 'time' ? 'time' : 'text'}
                  value={values[k]}
                  onChange={(e) => setValues({ ...values, [k]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        {extra.length > 0 && (
          <dl className={styles.extra}>
            {extra.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <details
          className={styles.rawText}
          onToggle={(e) => {
            if (!(e.currentTarget as HTMLDetailsElement).open || rawText !== null || rawState) return;
            setRawState('PDF를 읽는 중…');
            loadText(id)
              .then((t) => {
                setRawText(t);
                setRawState('');
              })
              .catch((err) => setRawState(`읽기 실패: ${(err as Error).message}`));
          }}
        >
          <summary>PDF에서 읽은 글 보기</summary>
          {rawState && <p className={styles.small}>{rawState}</p>}
          {rawText !== null &&
            (rawText.trim() ? (
              <>
                <p className={styles.small}>{rawText.length}자</p>
                <pre>{rawText}</pre>
              </>
            ) : (
              <p className={styles.small}>글자가 하나도 없습니다. 글자가 아닌 이미지로 만들어진 PDF입니다.</p>
            ))}
        </details>
        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            닫기
          </button>
          <button type="submit" className={styles.primaryBtn}>
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
