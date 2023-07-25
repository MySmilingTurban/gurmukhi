import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useUserAuth } from '../UserAuthContext';
import { auth } from '../../firebase';

function Profile() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUserAuth();

  useEffect(() => {
    setIsLoading(true);
    auth.onAuthStateChanged((usr) => {
      if (usr) {
        setAuthUser(usr);
        setIsLoading(false);
      } else {
        setAuthUser(null);
      }
    })
  }, []);

  const editUrl = `/users/edit/${user.uid}`;

  if (isLoading) return <h2>Loading...</h2>;
  return (
    <div className="container m-4">
      <Card>
        <Card.Body>
          <Card.Title>Profile<Button href={editUrl} style={{backgroundColor: 'transparent', border: 'transparent'}} hidden={user?.role != 'admin'}>🖊️</Button></Card.Title>
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
