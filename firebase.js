// Import the functions you need from the SDKs you need
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import firebase from 'firebase/compat/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAPRWwHFZ5K6ZxicdiXbtMNvoyJJkUud-w",
  authDomain: "crypto-tracker-bac7e.firebaseapp.com",
  projectId: "crypto-tracker-bac7e",
  storageBucket: "crypto-tracker-bac7e.appspot.com",
  messagingSenderId: "1064809502107",
  appId: "1:1064809502107:web:bd3d4cb9dd63a1726c3d3e",
  measurementId: "G-ZGGXFDSL6C"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app)
const auth = getAuth()
// const firebaseApp = firebase.initializeApp(firebaseConfig);
// const auth = app.auth();

export const getMyUid = async () => {
  let uid;
  auth.onAuthStateChanged( async (userAuth) => {
    console.log(userAuth);
    if (userAuth) {
      //User is logged in
      console.log('here');
      uid = userAuth.uid;
    } 
  });

  console.log(auth);
  console.log(uid);
  return uid
}

export default app;
export { auth, db };
