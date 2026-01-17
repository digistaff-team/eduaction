import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAEtlQK-RdWHB6wZoiReS7XqJ6MCHkZ1vw",
  authDomain: "eduaction-598d4.firebaseapp.com",
  projectId: "eduaction-598d4",
  storageBucket: "eduaction-598d4.firebasestorage.app",
  messagingSenderId: "404881113797",
  appId: "1:404881113797:web:1b21b56dc173fa0eb4a6ac"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт сервисов
export const db = getFirestore(app);
export const auth = getAuth(app);
