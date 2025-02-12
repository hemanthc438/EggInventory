// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACT9T0ptl6X0F-NDRifWyL77Y_mEyOdAQ",
  authDomain: "eggcounter-egg.firebaseapp.com",
  projectId: "eggcounter-egg",
  storageBucket: "eggcounter-egg.firebasestorage.app",
  messagingSenderId: "167051062348",
  appId: "1:167051062348:web:2c8bc0fcf3cf17459dd8e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)