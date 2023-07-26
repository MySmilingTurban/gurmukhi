/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { SignOutUser, userStateListener } from '../firebase';
import { createContext, useState, useEffect } from 'react';
import { getUser } from '../components/util/users';
import { ChildrenProps, LocalUser } from '../types/user';

export const AuthContext = createContext({
  // 'User' comes from firebase auth-public.d.ts
  currentUser: {} as LocalUser | null,
  setCurrentUser: (_user:LocalUser) => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }: ChildrenProps) => {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    const unsubscribe = userStateListener((user) => {
      if (user) {
        const { uid, email } = user
        const userData = getUser(email ?? '', uid)
        .then((data) => 
          {
            // if (!data) console.log('Invalid user');
            // else console.log('Valid user');
            const userData = {
              user,
              uid,
              email: data?.email,
              displayName: data?.name,
              photoURL: '',
              role: data?.role,
            };
            setCurrentUser(userData);
        })
      }
    });
    return unsubscribe
  }, [setCurrentUser]);

  // As soon as setting the current user to null, 
  // the user will be redirected to the home page. 
  const signOut = () => {
    SignOutUser()
    setCurrentUser(null)
  }

  const value = {
    currentUser, 
    setCurrentUser,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
