import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAjzKg7VDkgQBVTHcjBLQddXODiUe3vObA",
  authDomain: "tocmaster-dev.firebaseapp.com",
  projectId: "tocmaster-dev",
  storageBucket: "tocmaster-dev.appspot.com",
  messagingSenderId: "64388444334",
  appId: "1:64388444334:web:b1ea23a91d236207e27d3f"
};

const app = initializeApp(firebaseConfig);
export const firebaseDB = Firestore.getFirestore()

export const getCollection = <T> (path:string) => {
  return Firestore.collection(firebaseDB,path) as Firestore.CollectionReference<T>
}

export const deleteDocument=(path:string,id:string) => {
  const doc = Firestore.doc(firebaseDB,`${path}/${id}`)
  Firestore.deleteDoc(doc)
}
