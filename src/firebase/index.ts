// Import the functions you need from the SDKs you need
import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3Ii36kJpSDycgU9-MDxh_J3lFtO6SMzI",
  authDomain: "toc-personal.firebaseapp.com",
  projectId: "toc-personal",
  storageBucket: "toc-personal.appspot.com",
  messagingSenderId: "682132870790",
  appId: "1:682132870790:web:dea94e438bb6f514bfa307",
  measurementId: "G-3VLXJYQWJ7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseDB = Firestore.getFirestore(app);
export const getCollection = <T>(path: string) => {
  return Firestore.collection(firebaseDB, "/projects") as Firestore.CollectionReference<T>;
};
