import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
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

export const app = getApps()[0] || initializeApp(firebaseConfig);
export const auth = getAuth(app);
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
  const entry = { token: cred.accessToken, expires: Date.now() + 55 * 60 * 1000 };
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(entry));
  } catch {
    /* 저장이 막혀 있어도 이번 화면에서는 동작합니다 */
  }
  memoryToken = entry;
  return entry.token;
}

let memoryToken = null;

export function getDriveToken() {
  let entry = memoryToken;
  if (!entry) {
    try {
      entry = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null');
    } catch {
      entry = null;
    }
  }
  return entry && entry.expires > Date.now() ? entry.token : null;
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

export async function reconnectDrive() {
  const result = await reauthenticateWithPopup(auth.currentUser, provider());
  return saveToken(result);
}

export async function logOut() {
  clearDriveToken();
  await signOut(auth);
}

export { onAuthStateChanged };
