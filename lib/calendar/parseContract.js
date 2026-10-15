// 계약서 PDF에서 뽑아낸 텍스트를 예약 정보로 바꿉니다.
// 키워드는 기존 계약서 양식(_old/wedding_snap_contract.html)의 항목 이름을 따릅니다.
// 양식이 바뀌면 LABELS의 키워드만 맞춰 주면 됩니다.

// 분석 규칙이 바뀌면 올립니다. 저장된 결과의 버전이 다르면 계약서를 다시 분석합니다.
export const PARSER_VERSION = 3;

const LABELS = {
  // 촬영(예식) 날짜로 볼 키워드. 앞에 있을수록 우선합니다.
  shootDate: ['본식 날짜', '본식날짜', '본식일', '예식일', '촬영일', '행사일', '예식일시', '예식 일시', '촬영 일시', '예식날짜', '촬영날짜', '본식 일자', '예식 일자', '촬영 일자'],
  // 다른 날짜 항목 (값을 자를 때 경계로 씁니다)
  notShootDate: ['계약일', '작성일', '계약 일자', '입금일', '잔금일', '납품일', '발송일'],
  groom: ['신랑 성함', '신랑성함', '신랑 성명', '신랑명', '신랑'],
  bride: ['신부 성함', '신부성함', '신부 성명', '신부명', '신부'],
  hall: ['홀 이름', '홀이름', '홀명'],
  venue: ['예식장', '웨딩홀', '예식 장소', '예식장소', '촬영 장소', '촬영장소', '장소'],
  product: ['본식스냅 상품구성', '상품구성', '상품명', '상품', '패키지', '촬영 상품', '옵션'],
  total: ['총액', '총 금액', '총금액', '계약금액', '촬영비', '합계'],
  deposit: ['계약금', '예약금'],
  balance: ['잔금'],
};

const DATE_PATTERNS = [
  // 2026년 11월 7일 (토), 27년 10월 26일 토요일 (계약서 폼의 안내 형식)
  /(?<!\d)(20\d{2}|\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g,
  // 2026.11.07 / 2026-11-07 / 2026/11/7
  /(20\d{2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})(?!\d)/g,
  // 26.11.07
  /(?<!\d)(\d{2})\s*[./]\s*(\d{1,2})\s*[./]\s*(\d{1,2})(?!\d)/g,
];

const PHONE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g;

function normalize(text) {
  return text
    .replace(/ /g, ' ')
    .replace(/[：﹕]/g, ':')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r/g, '');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(y, m, d) {
  let year = Number(y);
  if (year < 100) year += 2000;
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCMonth() !== month - 1) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

// 연도 없이 "10월 26일"만 쓴 경우
const MONTH_DAY = /(?<!\d)(\d{1,2})\s*월\s*(\d{1,2})\s*일/g;

// 연도가 없는 날짜는 기준일(계약서 작성 무렵) 이후 가장 가까운 해로 봅니다.
function withYear(month, day, refISO) {
  const ref = refISO ? new Date(refISO) : new Date();
  const refDay = `${ref.getFullYear()}-${pad(ref.getMonth() + 1)}-${pad(ref.getDate())}`;
  const same = toISODate(ref.getFullYear(), month, day);
  if (same && same >= refDay) return same;
  return toISODate(ref.getFullYear() + 1, month, day);
}

// 텍스트 안의 날짜를 위치와 함께 모두 찾습니다.
export function findDates(text, refISO) {
  const found = [];
  const overlaps = (m) => found.some((f) => m.index < f.end && f.index < m.index + m[0].length);
  for (const re of DATE_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const iso = toISODate(m[1], m[2], m[3]);
      if (!iso || overlaps(m)) continue;
      found.push({ iso, index: m.index, end: m.index + m[0].length });
    }
  }
  MONTH_DAY.lastIndex = 0;
  let m;
  while ((m = MONTH_DAY.exec(text))) {
    if (overlaps(m)) continue;
    const iso = withYear(m[1], m[2], refISO);
    if (iso) found.push({ iso, index: m.index, end: m.index + m[0].length, yearless: true });
  }
  return found.sort((a, b) => a.index - b.index);
}

// "오후 1시 30분", "13:30", "PM 2:00", "1시반" 같은 시간을 HH:MM으로 바꿉니다.
export function findTime(text) {
  const re = /(오전|오후|AM|PM|am|pm)?\s*(\d{1,2})\s*(?::\s*(\d{2})|시\s*(?:(\d{1,2})\s*분|(반))?)/g;
  let m;
  while ((m = re.exec(text))) {
    const isColon = m[3] !== undefined;
    const ampm = m[1];
    if (!isColon && !/시/.test(m[0])) continue;
    let h = Number(m[2]);
    const min = isColon ? Number(m[3]) : m[5] ? 30 : Number(m[4] || 0);
    if (h > 24 || min > 59) continue;
    if (ampm && /오후|pm/i.test(ampm) && h < 12) h += 12;
    if (ampm && /오전|am/i.test(ampm) && h === 12) h = 0;
    // 예식은 보통 낮 시간이라 "1시"처럼 오전/오후 표시가 없으면 오후로 봅니다.
    if (!ampm && !isColon && h >= 1 && h <= 7) h += 12;
    return `${pad(h)}:${pad(min)}`;
  }
  return null;
}

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "라벨 : 값" 형태에서 값을 꺼냅니다. 같은 줄에 값이 없으면(계약서 폼을 인쇄한 PDF처럼
// "본식 날짜 *" 다음 줄에 값이 있는 경우) 다음 줄을 값으로 씁니다.
const ALL_LABELS = () => Object.values(LABELS).flat();

// 다음 줄이 다른 항목 제목이면 값이 비어 있는 것으로 봅니다. (폼 제목에는 필수 표시 * 가 붙습니다)
function isLabelLine(line) {
  if (/(^|\s)\*(\s|$)/.test(line)) return true;
  return ALL_LABELS().some((l) => new RegExp(`^${escapeRe(l)}\\s*(?:[:*|]|$)`).test(line.trim()));
}

function valueAfter(text, labels, { maxLen = 40 } = {}) {
  for (const label of labels) {
    const re = new RegExp(`(?:^|[\\s\\[(|·•■□▶-])${escapeRe(label)}(?=\\s*[:*)\\]|]|\\s|$)`, 'gm');
    let m;
    while ((m = re.exec(text))) {
      const after = text.slice(m.index + m[0].length);
      const lineEnd = after.indexOf('\n');
      let v = (lineEnd < 0 ? after : after.slice(0, lineEnd)).replace(/^[\s:*|)\]]+/, '');
      if (!v.trim() && lineEnd >= 0) {
        const next = after.slice(lineEnd + 1).split('\n')[0] || '';
        if (isLabelLine(next)) continue;
        v = next;
      }
      // 같은 줄에 다른 라벨이 이어지면 거기서 자릅니다. ("신랑: 홍길동 신부: 김영희")
      for (const other of ALL_LABELS().filter((l) => l !== label)) {
        const idx = v.search(new RegExp(`\\s${escapeRe(other)}\\s*[:|*]`));
        if (idx > 0) v = v.slice(0, idx);
      }
      v = v.replace(/^[:|\s]+/, '').replace(/[|\s]+$/, '').slice(0, maxLen).trim();
      if (v) return v;
    }
  }
  return null;
}

function nameAfter(text, labels) {
  const v = valueAfter(text, labels, { maxLen: 20 });
  if (!v) return null;
  const m = /^([가-힣]{2,5}|[A-Za-z][A-Za-z ]{1,30})/.exec(v);
  return m ? m[1].trim() : null;
}

function moneyAfter(text, labels) {
  const v = valueAfter(text, labels, { maxLen: 30 });
  if (!v) return null;
  const m = /([\d,]{3,})\s*(만\s*원|원)?/.exec(v);
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ''));
  if (m[2] && /만/.test(m[2])) n *= 10000;
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 본식 날짜 항목 바로 뒤에 나오는 날짜만 씁니다.
// 예전에는 항목을 못 찾으면 문서의 첫 날짜를 썼는데, 그게 인쇄 날짜나 약관 속 날짜여서
// 엉뚱한 날에 표시됐습니다. 이제는 못 찾으면 비워 두고 "확인이 필요한 계약서"로 보냅니다.
function pickShootDate(text, dates) {
  for (const label of LABELS.shootDate) {
    const re = new RegExp(escapeRe(label), 'g');
    let m;
    while ((m = re.exec(text))) {
      const start = m.index + label.length;
      const after = dates.find((d) => d.index >= start && d.index - start <= 40);
      if (after) return after;
    }
  }
  return null;
}

// refISO: 연도가 빠진 날짜의 해를 정할 기준일 (보통 계약서 파일을 만든 날)
export function parseContract(rawText, fileName = '', refISO) {
  const text = normalize(rawText || '');
  const dates = findDates(text, refISO);
  const picked = pickShootDate(text, dates);

  let date = null;
  let time = null;
  let dateSource = null;
  if (picked) {
    date = picked.iso;
    dateSource = picked.yearless ? 'label-no-year' : 'label';
    time = findTime(text.slice(picked.end, picked.end + 30));
  }
  // 파일명의 날짜는 계약일이라 본식 날짜로 쓰지 않습니다.
  if (!time) {
    const timeLine = valueAfter(text, ['예식 시간', '예식시간', '예식 시간', '본식시간', '본식 시간', '촬영시간', '촬영 시간', '시간']);
    if (timeLine) time = findTime(timeLine);
  }

  const phones = [...new Set((text.match(PHONE) || []).map(formatPhone))];

  return {
    date,
    time,
    dateSource,
    groom: nameAfter(text, LABELS.groom),
    bride: nameAfter(text, LABELS.bride),
    venue: [valueAfter(text, LABELS.venue), valueAfter(text, LABELS.hall)].filter(Boolean).join(' ') || null,
    product: valueAfter(text, LABELS.product),
    total: moneyAfter(text, LABELS.total),
    deposit: moneyAfter(text, LABELS.deposit),
    balance: moneyAfter(text, LABELS.balance),
    phones,
  };
}

export function bookingTitle(b) {
  const couple = [b.groom, b.bride].filter(Boolean).join(' ♥ ');
  return couple || b.fileName?.replace(/\.pdf$/i, '') || '예약';
}
