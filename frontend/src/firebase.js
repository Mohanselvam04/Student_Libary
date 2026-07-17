import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBfxXLZ27h-bTm_KbBJV6lD7MpIYkMWRf4',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'student-lib-fcbfb.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'student-lib-fcbfb',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'student-lib-fcbfb.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '989459228735',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:989459228735:web:80c89d8e0750f006e9308a',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-1KBVQ83XXC'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
