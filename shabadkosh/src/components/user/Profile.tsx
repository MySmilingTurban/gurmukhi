import React, { Component, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useUserAuth } from '../UserAuthContext';
import { auth } from '../../firebase';

function Profile() {
  const [authUser, setAuthUser] = useState<any>(null);
  const { user } = useUserAuth();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
  }, []);

  return (
    <div className="container m-4">
      <Card>
        <Card.Body>
          <Card.Title>Profile</Card.Title>
          <Card.Text>
            <p>Name: {user?.displayName}</p>
            <p>Role: {user?.role}</p>
            <p>Email: {authUser?.email}</p>
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;
