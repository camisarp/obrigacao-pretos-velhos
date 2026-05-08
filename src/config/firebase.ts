import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCMmTsBY9KKa7-VUs7QPo_Q3wMxh_WnLVQ',
  authDomain: 'obrigacao-pretos-velhos.firebaseapp.com',
  projectId: 'obrigacao-pretos-velhos',
  storageBucket: 'obrigacao-pretos-velhos.firebasestorage.app',
  messagingSenderId: '604295724540',
  appId: '1:604295724540:web:ebf88353bf77bf80d98679',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);