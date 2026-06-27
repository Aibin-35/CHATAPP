import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDk01t57ODtNUPkbEgvMcJXAApBWeGXK-4",
  authDomain: "my-chat-room-baae4.firebaseapp.com",
  projectId: "my-chat-room-baae4",
  storageBucket: "my-chat-room-baae4.firebasestorage.app",
  messagingSenderId: "728207491115",
  appId: "1:728207491115:web:bd3bf0db4d25936b04ea6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);
