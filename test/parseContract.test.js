import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContract, findTime } from '../lib/calendar/parseContract.js';

test('라벨이 있는 일반적인 계약서', () => {
  const text = `디어메모리 본식스냅 촬영 계약서
계약일 : 2026년 3월 2일
신랑 : 홍길동  연락처 : 010-1234-5678
신부 : 김영희  연락처 : 010 9876 5432
예식일시 : 2026년 11월 7일 (토) 오후 1시 30분
예식장 : 더채플앳청담 3층 루체홀
상품명 : 본식스냅 프리미엄 + 원판
총 금액 : 1,500,000원
계약금 : 300,000원
잔금 : 1,200,000원`;
  const r = parseContract(text, 'DM 홍길동 김영희.pdf');
  assert.equal(r.date, '2026-11-07');
  assert.equal(r.time, '13:30');
  assert.equal(r.dateSource, 'label');
  assert.equal(r.groom, '홍길동');
  assert.equal(r.bride, '김영희');
  assert.equal(r.venue, '더채플앳청담 3층 루체홀');
  assert.equal(r.product, '본식스냅 프리미엄 + 원판');
  assert.equal(r.total, 1500000);
  assert.equal(r.deposit, 300000);
  assert.equal(r.balance, 1200000);
  assert.deepEqual(r.phones, ['010-1234-5678', '010-9876-5432']);
});

test('점 형식 날짜와 24시간 시간, 한 줄에 두 라벨', () => {
  const text = `작성일 2026.01.10\n신랑: 이철수 신부: 박민지\n본식일 2027.04.18 12:00\n장소: 그랜드힐컨벤션`;
  const r = parseContract(text, 'DM-contract.pdf');
  assert.equal(r.date, '2027-04-18');
  assert.equal(r.time, '12:00');
  assert.equal(r.groom, '이철수');
  assert.equal(r.bride, '박민지');
  assert.equal(r.venue, '그랜드힐컨벤션');
});

test('본식 날짜 항목이 없으면 문서의 다른 날짜를 쓰지 않음', () => {
  const text = `계약일 2026-02-01\n2026-09-12 촬영 예정`;
  assert.equal(parseContract(text, 'DM_20260912_최.pdf').date, null);
  assert.equal(parseContract(text, 'DM_최.pdf').date, null);
});

test('계약서 폼 형식: 두 자리 연도 (27년 10월 26일 토요일)', () => {
  const text = `본식 날짜*\n27년 10월 26일 토요일\n예식 시간*\n오후 3시 30분`;
  const r = parseContract(text, 'DM 김.pdf');
  assert.equal(r.date, '2027-10-26');
  assert.equal(r.time, '15:30');
});

test('인쇄 머리글 날짜가 앞에 있어도 본식 날짜를 고름', () => {
  const text = `26. 10. 15. 오후 3:12 디어메모리 본식스냅 계약서\n제 5조 계약일로부터 2026년 10월 20일까지\n본식 날짜*\n2027. 4. 18. 일요일`;
  assert.equal(parseContract(text, 'DM 이.pdf').date, '2027-04-18');
});

test('연도 없는 날짜는 계약서 만든 날 이후로', () => {
  const text = `본식 날짜 3월 14일 토요일`;
  assert.equal(parseContract(text, 'DM 박.pdf', '2026-10-15T01:00:00Z').date, '2027-03-14');
  assert.equal(parseContract(text.replace('3월', '11월'), 'DM 박.pdf', '2026-10-15T01:00:00Z').date, '2026-11-14');
  assert.equal(parseContract(text, 'DM 박.pdf', '2026-10-15T01:00:00Z').dateSource, 'label-no-year');
});

test('파일명 날짜(계약일)는 본식 날짜로 쓰지 않음', () => {
  const r = parseContract('신랑 홍길동 신부 김영희', 'DM_20261107_홍길동.pdf');
  assert.equal(r.date, null);
  assert.equal(r.dateSource, null);
});

test('시간 표기', () => {
  assert.equal(findTime('오전 11시'), '11:00');
  assert.equal(findTime('2시반'), '14:30');
  assert.equal(findTime('PM 12:30'), '12:30');
  assert.equal(findTime('17:00'), '17:00');
  assert.equal(findTime('(토)'), null);
});

test('빈 텍스트(스캔본)는 날짜 없음', () => {
  const r = parseContract('', 'DM 스캔.pdf');
  assert.equal(r.date, null);
  assert.equal(r.groom, null);
});

test('디어메모리 계약서 양식 항목 이름', () => {
  const text = `본식스냅 계약서
신랑 성함 홍길동
신랑 연락처 010-1111-2222
신부 성함 김영희
신부 연락처 010-3333-4444
본식 날짜 2026-11-07
예식장 더채플앳청담
홀 이름 루체홀
예식 시간 오후 1시 30분
본식스냅 상품구성 기본 + 원판`;
  const r = parseContract(text, 'DM 홍길동.pdf');
  assert.equal(r.date, '2026-11-07');
  assert.equal(r.time, '13:30');
  assert.equal(r.groom, '홍길동');
  assert.equal(r.bride, '김영희');
  assert.equal(r.venue, '더채플앳청담 루체홀');
  assert.equal(r.product, '기본 + 원판');
  assert.deepEqual(r.phones, ['010-1111-2222', '010-3333-4444']);
});

test('계약서 폼을 인쇄한 PDF (항목 다음 줄에 값, 머리글에 인쇄 날짜)', () => {
  const text = `26. 10. 15.   오후   3:12   디어메모리   계약서
제   3 조 . [ 계약금 ]
신랑   성함   *
홍길동
신랑   연락처   *
010-1111-2222
신부   성함   *
김영희
본식   날짜   *
27 년   10 월   26 일   토요일
예식장   *
더채플앳청담
홀   이름   *
루체홀
예식   시간   *
오후   3 시   30 분
본식스냅   상품구성   *
본식스냅   촬영   시   요청사항   ( 자세히 )   *`;
  const r = parseContract(text, 'DM 홍길동.pdf');
  assert.equal(r.date, '2027-10-26');
  assert.equal(r.time, '15:30');
  assert.equal(r.groom, '홍길동');
  assert.equal(r.bride, '김영희');
  assert.equal(r.venue, '더채플앳청담 루체홀');
  assert.equal(r.product, null);
});

test('이미지 계약서를 글자 인식(OCR)한 결과 (두 칸 배치, 전각 별표)', () => {
  const text = `본식스냄 계약서
신랑 성함 *                    신랑 연락처 *
홍길동                                    010-1234-5678
신부 성함 ＊                                신부 연락처 ＊
김영희                                     010-8765-4321
본식 날짜 ＊
27년 10월 26일 토요일
예식장 *                                   홀 이름 *
보타닉파크웨딩                           카라홀
예식 시간 *
오후 3시 30분`;
  const r = parseContract(text, 'DM-20261018-TW5E_촬영계약서.pdf', '2026-10-18T00:00:00Z');
  assert.equal(r.date, '2027-10-26');
  assert.equal(r.time, '15:30');
  assert.equal(r.groom, '홍길동');
  assert.equal(r.bride, '김영희');
  assert.equal(r.venue, '보타닉파크웨딩 카라홀');
});

test('글자 인식 결과처럼 라벨 글자 사이가 띄어져 있어도 본식 날짜를 찾음', () => {
  assert.equal(parseContract('본 식 날 짜 *\n2027년 3월 6일').date, '2027-03-06');
});
