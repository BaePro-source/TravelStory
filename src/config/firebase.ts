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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const WEB_CLIENT_ID = "256919720158-qaubk7eqeflfg0gg8sc1htiu1rcq75kp.apps.googleusercontent.com";

export default { auth, db, storage };

