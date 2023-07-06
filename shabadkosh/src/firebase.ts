import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  NextOrObserver,
  User
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const signInUser = async (
  email: string, 
  password: string
) => {
  if (!email && !password) return;

  return await signInWithEmailAndPassword(auth, email, password)
}

export const userStateListener = (callback:NextOrObserver<User>) => {
  return onAuthStateChanged(auth, callback)
}

export const SignOutUser = async () => await signOut(auth);

export const firestore = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

export default app;
