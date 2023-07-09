import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Card } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import GoogleButton from 'react-google-button';
import { useUserAuth } from '../UserAuthContext';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../../firebase';
import { checkUser } from '../util/users';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logIn, user } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const valid = await checkUser(email, password);
      if (!valid) throw new Error('Invalid user');
      else console.log('Valid user');
      const userDetails = localStorage.getItem('user');
      if (userDetails) {
        const user = JSON.parse(userDetails);
      }
      await logIn(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e: any) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithRedirect(auth, provider);

      navigate('/home');
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div className="container">
      <div className="p-4 box d-flex flex-column align-items-center">
        <h2 className="mb-3">Shabadkosh Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">
              Log In
            </Button>
          </div>
        </Form>
        <hr style={{width: '100%'}}/>
        {/* <div>
          <GoogleButton
            className="g-btn"
            type="dark"
            onClick={handleGoogleSignIn}
          />
        </div> */}
        <Card className="p-4 box mt-3 text-center" style={{width: '50%'}}>
          Contact the admin to get reviewer/admin access.<br/>
          Do not have an account?
          <Link to="/signup">Sign up</Link>
        </Card>
      </div>
    </div>
  );
};

export default Login;
