
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * تعليمات للمستخدم:
 * 1. اذهب إلى Firebase Console > Project Settings.
 * 2. انسخ كود firebaseConfig.
 * 3. استبدل القيم أدناه بالقيم الحقيقية التي حصلت عليها.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCq8TVGkTVCMTa4o9AM3x9LhLWqWEwMWUw",
  authDomain: "paperless-12a1b.firebaseapp.com",
  projectId: "paperless-12a1b",
  storageBucket: "paperless-12a1b.firebasestorage.app",
  messagingSenderId: "328469333876",
  appId: "1:328469333876:web:8d24faf089b0b837fb8e21",
  measurementId: "G-2TH70QV2KR"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير قاعدة البيانات لاستخدامها في باقي الصفحات
export const db = getFirestore(app);
