/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Card } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { useUserAuth } from '../UserAuthContext';
import { checkUser } from '../util/users';
import { UserCredential } from 'firebase/auth';
import GoogleButton from 'react-google-button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logIn, signInWithGoogle } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      await logIn(email, password).then((data: UserCredential) => {
        const {uid, email} = data.user
        if (email) {
          checkUser(uid, email).then((found) => {
            if (!found) {
              throw new Error('Invalid user');
            } else {
              console.log('Valid user');
            }
          })
        }
      })
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e: any) => {
    e.preventDefault();
    try {
      // left with getting confirmation of logging to navigate to homepage
      await signInWithGoogle().then((success: any) => {
        if (success) {
          navigate('/home')
        }
      })
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
        <div>
          <GoogleButton
            className="g-btn"
            type="dark"
            onClick={handleGoogleSignIn}
          />
        </div>
        <Card className="p-4 box mt-3 text-center" style={{width: '50%'}}>
          Contact the admin to get reviewer/admin access.<br/>
          Do not have an account?
          <a href="/signup">Sign up</a>

          <br />
          <Link to="/forgot-password">Forgot password!</Link>
        </Card>
      </div>
    </div>
  );
};

export default Login;
