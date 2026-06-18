// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDka1rsvpQ-v0WFWQ4yTMF-uzvxx8ZxzCk",
  authDomain: "chat-room-c5837.firebaseapp.com",
  projectId: "chat-room-c5837",
  storageBucket: "chat-room-c5837.firebasestorage.app",
  messagingSenderId: "5394439254",
  appId: "1:5394439254:web:e1c2afb31c67fadf6feff7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);