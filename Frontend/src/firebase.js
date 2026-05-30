import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDS8fqi9ptlgy4aIIumrHACQzvw130uCLY",
  authDomain: "blogify-cms.firebaseapp.com",
  projectId: "blogify-cms",
  storageBucket: "blogify-cms.firebasestorage.app",
  messagingSenderId: "1058160132702",
  appId: "1:1058160132702:web:6db312124251fc2cb3aacf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error(error);
  }
};

export const getLoginResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};