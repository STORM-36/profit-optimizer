// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ✅ YOUR REAL KEYS FROM THE SCREENSHOT
const firebaseConfig = {
  apiKey: "AIzaSyD6ZsXiud8e6xq5-GvMMo-DUjxh6cS_F0A",
  authDomain: "profit-optimizer-v1.firebaseapp.com",
  projectId: "profit-optimizer-v1",
  storageBucket: "profit-optimizer-v1.firebasestorage.app",
  messagingSenderId: "1025711639266",
  appId: "1:1025711639266:web:7e86bb89a86ee7ec426cbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 THESE ARE THE LINES YOU LIKELY MISSED BEFORE
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();