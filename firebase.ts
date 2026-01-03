
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * تعليمات للمستخدم:
 * 1. اذهب إلى Firebase Console > Project Settings.
 * 2. انسخ كود firebaseConfig.
 * 3. استبدل القيم أدناه بالقيم الحقيقية التي حصلت عليها.
 */
const firebaseConfig = {
  apiKey: "استبدل_هذا_بـ_API_KEY",
  authDomain: "استبدل_هذا_بـ_AUTH_DOMAIN",
  projectId: "استبدل_هذا_بـ_PROJECT_ID",
  storageBucket: "استبدل_هذا_بـ_STORAGE_BUCKET",
  messagingSenderId: "استبدل_هذا_بـ_SENDER_ID",
  appId: "استبدل_هذا_بـ_APP_ID"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير قاعدة البيانات لاستخدامها في باقي الصفحات
export const db = getFirestore(app);
