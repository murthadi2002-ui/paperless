
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCq8TVGkTVCMTa4o9AM3x9LhLWqWEwMWUw",
  authDomain: "paperless-12a1b.firebaseapp.com",
  projectId: "paperless-12a1b",
  storageBucket: "paperless-12a1b.firebasestorage.app",
  messagingSenderId: "328469333876",
  appId: "1:328469333876:web:8d24faf089b0b837fb8e21",
  measurementId: "G-2TH70QV2KR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
