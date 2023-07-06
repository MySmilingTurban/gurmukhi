import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleLogout = async () => {
      try {
        // await logOut();
        navigate("/");
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