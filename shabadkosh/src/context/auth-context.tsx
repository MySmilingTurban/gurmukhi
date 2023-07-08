import React from "react";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { SignOutUser, userStateListener } from "../firebase";
import { createContext, useState, useEffect, ReactNode } from "react";
import { getUser } from "../components/util/users";

interface ChildrenProps {
  children?: ReactNode
}

export interface LocalUser {
  user: User | null,
  uid?: string,
  email?: string,
  displayName?: string,
  photoURL?: string
  role?: string,
  username?: string
}

export const AuthContext = createContext({
  // "User" comes from firebase auth-public.d.ts
  currentUser: {} as LocalUser | null,
  setCurrentUser: (_user:LocalUser) => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }: ChildrenProps) => {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = userStateListener((user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user
        const userData = getUser(email ?? "", uid)
        .then((data) => 
          {
            // if (!data) console.log("Invalid user");
            // else console.log("Valid user");
            const userData = {
              user,
              uid,
              email: data?.email,
              displayName: data?.name,
              photoURL: "",
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
    navigate('/')
  }

  const value = {
    currentUser, 
    setCurrentUser,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
