import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContract, dateFromFileName, findTime } from '../lib/calendar/parseContract.js';

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

test('라벨이 없으면 계약일을 피하고 파일명 날짜를 우선', () => {
  const text = `계약일 2026-02-01\n2026-09-12 촬영 예정`;
  assert.equal(parseContract(text, 'DM_20260912_최.pdf').date, '2026-09-12');
  assert.equal(parseContract(text, 'DM_최.pdf').date, '2026-09-12');
});

test('파일명 날짜', () => {
  assert.equal(dateFromFileName('DM_20261107_홍길동.pdf'), '2026-11-07');
  assert.equal(dateFromFileName('DM 261107 홍길동.pdf'), '2026-11-07');
  assert.equal(dateFromFileName('DM 2026.11.7 홍길동.pdf'), '2026-11-07');
  assert.equal(dateFromFileName('DM 홍길동.pdf'), null);
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
