import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "<your_api_key>",
  authDomain: "vacai-476206.firebaseapp.com",
  projectId: "vacai-476206",
  storageBucket: "vacai-476206.firebasestorage.app",
  messagingSenderId: "304303513675",
  appId: "1:304303513675:web:b1c75a22efe0378388adce",
  measurementId: "G-W9ZLP4SPCM"
};

// Avoid reinitializing Firebase during hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
