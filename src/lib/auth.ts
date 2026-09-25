import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth"; import { auth } from "@/lib/firebase";
export const signInWithGoogle=()=>signInWithPopup(auth,new GoogleAuthProvider()); export const signOut=()=>firebaseSignOut(auth);
