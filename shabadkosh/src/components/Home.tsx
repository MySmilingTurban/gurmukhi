/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useUserAuth } from './UserAuthContext';

const Home = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div className="container p-4">
      <Card>
        <Card.Body className="m-2 p-2">
          <div className="p-4 box mt-3 text-center">
            Waheguru ji ka Khalsa, Waheguru ji ki Fateh {user?.displayName ?? ''} ji<br />
            Use the navigation bar to navigate through this app!<br /><br />
            It&apos;s a nice day for Gurmukhi ! <br />
          </div>
          <div className="d-grid gap-2 col-6 mx-auto">
            <Button variant="primary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
      </Card.Body>
      </Card>
    </div>
  );
};

export default Home;
