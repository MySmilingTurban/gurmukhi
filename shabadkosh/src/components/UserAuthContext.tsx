import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, firestore } from "../firebase";
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  updateCurrentUser,
} from "firebase/auth";
import { getUser } from "./util/users";
import { doc, setDoc } from "firebase/firestore";

const userAuthContext  = createContext<any>(null);

export function UserAuthContextProvider({ children }: { children:JSX.Element }) {
  const [user, setUser] = useState({});
  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(username: string, name: string, role: string, email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const { uid, email, displayName, photoURL } = user;
        const getUser = doc(firestore, `users/${uid}`);
        const setNewUser = setDoc(getUser, {
          username,
          name,
          role,
          email,
          displayName,
          photoURL,
        }).then((usr) => {
          console.log("New User added to firestore");
          console.log("User: ", usr);
        });
        // setUser(user);
        
        sendEmailVerification(auth.currentUser ?? user)
          .then((userCredential) => {
            let userCredentialUser = {...user};
            // Alert Email verification sent!
            alert("Email verification sent!");
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function logOut() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser: any) => {
      console.log("Auth", currentuser);
      const { uid, email, displayName, photoURL } = currentuser;
      const userData = getUser(email ?? "", uid)
        .then((data) => 
          {
            if (!data) console.log("Invalid user");
            else console.log("Valid user");
            const usr = {
              user,
              uid,
              email: data?.email,
              displayName: data?.name,
              photoURL: "",
              role: data?.role,
              username: data?.username
            };
            console.log("usr: ", usr);
            setUser(usr);
        })
      // setUser(currentuser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider value={{ user, logIn, signUp, logOut }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
