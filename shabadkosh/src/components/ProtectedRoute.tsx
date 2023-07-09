import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from './UserAuthContext';

const ProtectedRoute = ({ children }: { children:JSX.Element }) => {
  const { user } = useUserAuth();

  if (!user) {
    console.log('User is not logged in');
    return <Navigate to='/' />;
  }
  return children;
};

export default ProtectedRoute;
