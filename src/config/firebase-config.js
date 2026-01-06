import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBmKwvwI1-n0DDxkvJbQMqHMrYtP1nn4oc",
  authDomain: "bytesizeapp-f40ad.firebaseapp.com",
  projectId: "bytesizeapp-f40ad",
  storageBucket: "bytesizeapp-f40ad.firebasestorage.app",
  messagingSenderId: "1014667569260",
  appId: "1:1014667569260:web:3a85350ff5701fee5ed049",
  measurementId: "G-0PZHLW5P28"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider()

export const db = getFirestore(app)