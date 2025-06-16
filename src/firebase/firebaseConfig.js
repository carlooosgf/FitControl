// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA3Uuczfj6IV5M-Tm9Ts5KAWFiuFVWA7FQ",
  authDomain: "fit-control-10f07.firebaseapp.com",
  projectId: "fit-control-10f07",
  storageBucket: "fit-control-10f07.firebasestorage.app",
  messagingSenderId: "341718164809",
  appId: "1:341718164809:web:67bb89866f68649a2ba698",
  measurementId: "G-PXWSJNM9R0"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };
