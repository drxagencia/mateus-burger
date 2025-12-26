import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCnTKk4-WSvSpoy0onqWBTDLqDfY9oaEdE",
  authDomain: "drxagencia-6ce0a.firebaseapp.com",
  databaseURL: "https://drxagencia-6ce0a-default-rtdb.firebaseio.com",
  projectId: "drxagencia-6ce0a",
  storageBucket: "drxagencia-6ce0a.firebasestorage.app",
  messagingSenderId: "251757919420",
  appId: "1:251757919420:web:26a49c29d0bab8cafca4b9",
  measurementId: "G-V3L12DWZL5"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
