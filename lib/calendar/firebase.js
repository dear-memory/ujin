import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 계약서 페이지(app/dashboard)와 같은 Firebase 프로젝트를 씁니다.
const firebaseConfig = {
  apiKey: 'AIzaSyBfgL7gC-uQeeH2bBB4q2JRTnk2ooRTZF8',
  authDomain: 'mkstroy-3dc7e.firebaseapp.com',
  projectId: 'mkstroy-3dc7e',
  storageBucket: 'mkstroy-3dc7e.firebasestorage.app',
  messagingSenderId: '1041941827601',
  appId: '1:1041941827601:web:4004c163fdd00586afa1b0',
};

// 할일장(dear-memory.github.io/todo-app)도 같은 주소(dear-memory.github.io)와 같은 Firebase 프로젝트를 씁니다.
// 기본 앱([DEFAULT])을 쓰면 브라우저에 저장되는 로그인 정보가 같은 칸에 들어가서,
// 캘린더에 로그인하면 할일장의 로그인 계정까지 바뀝니다. 그래서 캘린더는 이름 있는 앱을 씁니다.
const existing = getApps().find((a) => a.name === 'calendar');
export const app = existing || initializeApp(firebaseConfig, 'calendar');
export const auth = existing
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });

// Drive 토큰만 받기 위한 별도 앱입니다. 화면 로그인과 섞이지 않아서
// 캘린더에 로그인한 계정과 다른 Google 계정의 Drive도 연결할 수 있습니다.
const driveApp = getApps().find((a) => a.name === 'drive') || initializeApp(firebaseConfig, 'drive');
const driveAuth = initializeAuth(driveApp, {
  persistence: inMemoryPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
export const db = getFirestore(app);

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const TOKEN_KEY = 'dm.driveToken';

function provider() {
  const p = new GoogleAuthProvider();
  p.addScope(DRIVE_SCOPE);
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}

// Firebase는 Google 액세스 토큰을 로그인 직후에만 돌려주고 갱신하지 않습니다.
// 그래서 토큰을 탭 세션에 1시간 미만으로 보관하고, 만료되면 다시 팝업으로 받습니다.
function saveToken(result) {
  const cred = GoogleAuthProvider.credentialFromResult(result);
  if (!cred?.accessToken) return null;
  const entry = {
    token: cred.accessToken,
    email: result.user?.email || null,
    expires: Date.now() + 55 * 60 * 1000,
  };
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(entry));
  } catch {
    /* 저장이 막혀 있어도 이번 화면에서는 동작합니다 */
  }
  memoryToken = entry;
  return entry.token;
}

let memoryToken = null;

function tokenEntry() {
  let entry = memoryToken;
  if (!entry) {
    try {
      entry = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null');
    } catch {
      entry = null;
    }
  }
  return entry && entry.expires > Date.now() ? entry : null;
}

export function getDriveToken() {
  return tokenEntry()?.token || null;
}

// Drive를 연결한 Google 계정 (로그인 계정과 다를 수 있음)
export function getDriveEmail() {
  return tokenEntry()?.email || null;
}

export function clearDriveToken() {
  memoryToken = null;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export async function signIn() {
  const result = await signInWithPopup(auth, provider());
  saveToken(result);
  return result.user;
}

// 어떤 Google 계정이든 골라서 Drive 읽기 권한만 받습니다.
export async function reconnectDrive() {
  const result = await signInWithPopup(driveAuth, provider());
  const token = saveToken(result);
  await signOut(driveAuth);
  return token;
}

const AUTH_ERRORS = {
  'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
  'auth/cancelled-popup-request': '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
  'auth/popup-blocked': '브라우저가 로그인 창을 막았습니다. 팝업을 허용한 뒤 다시 시도해 주세요.',
  'auth/unauthorized-domain': '이 주소가 Firebase 승인된 도메인에 없습니다. Firebase 콘솔에서 추가해 주세요.',
  'auth/operation-not-allowed': 'Firebase에서 Google 로그인이 꺼져 있습니다.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
};

export function authErrorMessage(e) {
  return AUTH_ERRORS[e?.code] || e?.message || String(e);
}

export async function logOut() {
  clearDriveToken();
  await signOut(auth);
}

export { onAuthStateChanged };
