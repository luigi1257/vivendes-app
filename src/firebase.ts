// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLwtzmKy_aDzlscRDUk28vmIvrnbcnX6c",
  authDomain: "manteniment-vivendes.firebaseapp.com",
  projectId: "manteniment-vivendes",
  storageBucket: "manteniment-vivendes.firebasestorage.app",
  messagingSenderId: "679771821302",
  appId: "1:679771821302:web:b278f3124f3d19dd8848d7"
  // ⚠️ NO cal measurementId ni res més
};

console.log("FIREBASE CONFIG EN EXECUCIÓ:", firebaseConfig);

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

