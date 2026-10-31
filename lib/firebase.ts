// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCic3Oy1gSIG2IgdyEoT8HBfV16-jOzKOQ",
  authDomain: "dawa2u-2389a.firebaseapp.com",
  projectId: "dawa2u-2389a",
  storageBucket: "dawa2u-2389a.firebasestorage.app",
  messagingSenderId: "324260137780",
  appId: "1:324260137780:web:f8d9fcdb1abc0e16b67361",
  measurementId: "G-L7J14G0C67"
};

// Initialize Firebase (prevents duplicate initialization errors in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Cloud Firestore
export const db = getFirestore(app);