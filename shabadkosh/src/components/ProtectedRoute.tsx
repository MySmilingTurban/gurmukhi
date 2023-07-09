import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUserAuth } from "./UserAuthContext";
import { auth } from "../firebase";
import { UserState } from "../types/user";

const ProtectedRoute = ({ children }: { children:JSX.Element }) => {
  const state = useSelector((state: UserState) => state.auth.user)
  const { user } = useUserAuth();

  // console.log("Stated: ", state);

  if (!user) {
    console.log("User is not logged in");
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
