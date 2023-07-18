/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../UserAuthContext';

export default function Logout() {
  const navigate = useNavigate();
  const {logOut} = useUserAuth();
  
  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logOut();
        navigate('/');
      } catch (error: any) {
        console.log(error.message);
      }
    };
    handleLogout();
  }, []);
  
  return (
    <div>Logout</div>
  )
}
