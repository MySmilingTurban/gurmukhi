import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "./UserAuthContext";
import { useSelector } from "react-redux";
import { UserState } from "../store/reducers/authReducer";
import { auth } from "../firebase";

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
