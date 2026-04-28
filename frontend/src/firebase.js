// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLV6-DJTOqlxNv6Lc79LrM-kpwpLUGEpw",
    authDomain: "ritconnect-f4c31.firebaseapp.com",
    projectId: "ritconnect-f4c31",
    storageBucket: "ritconnect-f4c31.firebasestorage.app",
    messagingSenderId: "440809006695",
    appId: "1:440809006695:web:a6565823de9a4eb35716c2",
    measurementId: "G-K22HEHMNVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;