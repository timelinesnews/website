// firebase/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjFpTIZKUMKERx4T4ND8A49UM0RbzcRSQ",
  authDomain: "timelines-a7b34.firebaseapp.com",
  projectId: "timelines-a7b34",
  storageBucket: "timelines-a7b34.firebasestorage.app",
  messagingSenderId: "438414274791",
  appId: "1:438414274791:web:e44a1a3fc24c493f897242",
  measurementId: "G-ZTZ6TH9MHZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
