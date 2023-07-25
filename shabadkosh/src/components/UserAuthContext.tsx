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
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { checkUser, getUser } from './util/users';
import { Timestamp, doc, setDoc } from 'firebase/firestore';

const userAuthContext  = createContext<any>(null);

export function UserAuthContextProvider({ children }: { children:JSX.Element }) {
  const [user, setUser] = useState({});

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then((userCredential) => {
      const {uid, email, displayName} = userCredential.user
      return checkUser(uid, email ?? '').then((found) => {
        if (!found) {
          const getUser = doc(firestore, `users/${uid}`)
          setDoc(getUser, {
            role: 'creator',
            email,
            displayName: displayName ?? email?.split('@')[0],
            created_at: Timestamp.now(),
            created_by: 'self',
            updated_at: Timestamp.now(),
            updated_by: 'self',
          }).then(() => {
            console.log('New User added to firestore');
            return true
          });
        } else {
          console.log('Valid user');
          return true
        }
        setUser(userCredential.user)
      })
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

  async function signUp(name: string, role: string, email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        const { uid, email, displayName } = user;
        const getUser = doc(firestore, `users/${uid}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        await setDoc(getUser, {
          name,
          role,
          email,
          displayName: displayName ?? name,
          created_at: Timestamp.now(),
          created_by: 'self',
          updated_at: Timestamp.now(),
          updated_by: 'self'
        }).then(() => {
          console.log('New User added to firestore');
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
      if (currentuser !== null) {
        const { uid, email } = currentuser;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const userData = getUser(email ?? '', uid)
          .then((data) => 
            {
              const usr = {
                user,
                uid,
                email: data?.email,
                displayName: data?.displayName,
                photoURL: '',
                role: data?.role,
              };
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
    <userAuthContext.Provider value={{ user, logIn, signUp, logOut, signInWithGoogle }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
