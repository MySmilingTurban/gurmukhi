/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { getUser } from './util/users';
import { Timestamp, doc, setDoc } from 'firebase/firestore';

const userAuthContext  = createContext<any>(null);

export function UserAuthContextProvider({ children }: { children:JSX.Element }) {
  const [user, setUser] = useState({});
  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(name: string, role: string, email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        const { uid, email, displayName } = user;
        const getUser = doc(firestore, `users/${uid}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const setNewUser = setDoc(getUser, {
          name,
          role,
          email,
          pwd: password,
          displayName: displayName ?? name,
          created_at: Timestamp.now(),
          created_by: 'self',
          updated_at: Timestamp.now()
        }).then((usr) => {
          console.log('New User added to firestore');
          console.log('User: ', usr);
        });
        setUser(user);
        
        sendEmailVerification(auth.currentUser ?? user)
          .then(() => {
            // const userCredentialUser = {...user};
            // Alert Email verification sent!
            alert('Email verification sent!');
          });
        return true;
      })
      .catch((error) => {
        if (error.code == 'auth/email-already-in-use') {
          alert('The email address is already in use');
        } else if (error.code == 'auth/invalid-email') {
          alert('The email address is not valid.');
        } else if (error.code == 'auth/operation-not-allowed') {
          alert('Operation not allowed.');
        } else if (error.code == 'auth/weak-password') {
          alert('The password is too weak.');
        }
        console.log(error);
        return false;
      });
  }
  function logOut() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser: any) => {
      // console.log('Current user from UserAuthContext: ', currentuser);
      if (currentuser === null) {
        // navigate('/')
      } else {
        const { uid, email } = currentuser;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const userData = getUser(email ?? '', uid)
          .then((data) => 
            {
              // if (!data) console.log('Invalid user');
              // else console.log('Valid user');
              const usr = {
                user,
                uid,
                email: data?.email,
                displayName: data?.name,
                photoURL: '',
                role: data?.role,
              };
              // console.log('usr: ', usr);
              setUser(usr);
          })
      }
      setUser(currentuser);
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
