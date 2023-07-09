import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "./UserAuthContext";
import { auth } from "../firebase";
import { UserState } from "../types/user";

const ProtectedRoute = ({ children }: { children:JSX.Element }) => {
  const { user } = useUserAuth();

  if (!user) {
    console.log("User is not logged in");
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
