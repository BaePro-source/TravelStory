// src/config/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAnboyNmbq3_EUuUa867-XTxifIl8U2o3s",
    authDomain: "hb-pro-4d76a.firebaseapp.com",
    projectId: "hb-pro-4d76a",
    storageBucket: "hb-pro-4d76a.firebasestorage.app",
    messagingSenderId: "256919720158",
    appId: "1:256919720158:web:44fb8fc17049fd1e9b324f"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 가급적 기존 코드 수정을 줄이기 위해 함수 형태로 내보냅니다.
export const auth = () => getAuth(app);
export const db = () => getFirestore(app);
export const storage = () => getStorage(app);

export default { auth, db, storage };
