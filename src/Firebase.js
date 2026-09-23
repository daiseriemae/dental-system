import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider
} from "firebase/auth";
import {
    getFirestore
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAG2ONx2SIdplHISxgfACTykDvKUTcuzsk",
    authDomain: "fir-auth-a00a3.firebaseapp.com",
    projectId: "fir-auth-a00a3",
    storageBucket: "fir-auth-a00a3.firebasestorage.app",
    messagingSenderId: "3434992481",
    appId: "1:3434992481:web:55bf8af6059e10dde8eb20"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider =
    new GoogleAuthProvider();

export const db = getFirestore(app);