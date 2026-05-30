import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blogify-cms.firebaseapp.com",
  projectId: "blogify-cms",
  storageBucket: "blogify-cms.firebasestorage.app",
  messagingSenderId: "1058160132702",
  appId: "1:1058160132702:web:6db312124251fc2cb3aacf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  try {
    auth.useDeviceLanguage();
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};