import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

// 분석 결과를 사용자별로 저장해, 수정되지 않은 계약서는 다시 내려받지 않습니다.
// 직접 고친 값(overrides)은 다시 분석해도 유지됩니다.
function col(uid) {
  return collection(db, 'users', uid, 'bookings');
}

export async function loadBookings(uid) {
  const snap = await getDocs(col(uid));
  const map = new Map();
  snap.forEach((d) => map.set(d.id, d.data()));
  return map;
}

export async function saveParsed(uid, file, parsed, textLength) {
  await setDoc(
    doc(col(uid), file.id),
    {
      fileName: file.name,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink || null,
      parsed,
      textLength,
      parsedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveOverrides(uid, fileId, overrides) {
  await setDoc(doc(col(uid), fileId), { overrides }, { merge: true });
}

export async function removeBooking(uid, fileId) {
  await deleteDoc(doc(col(uid), fileId));
}

// 자동 분석 값 위에 직접 고친 값을 덮어씁니다.
export function effective(record) {
  const o = record.overrides || {};
  const p = record.parsed || {};
  const out = { ...p };
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}
