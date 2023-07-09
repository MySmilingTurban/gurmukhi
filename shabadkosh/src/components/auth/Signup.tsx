import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../UserAuthContext";
import { checkIfEmailUnique, checkIfUsernameUnique } from "../util/users";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [diplayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const { signUp } = useUserAuth();
  let navigate = useNavigate();

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError("");
    try {
      const role = "creator";
      await checkIfEmailUnique(email).then(async (unique) => {
        if (unique) {
          await signUp(diplayName, role, email, password).then((val: any) => {
            console.log("val: ", val);
            if (val) {
              navigate("/home");
            }
          });
        } else {
          setError("Username already exists!");
        }
      })

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container justify-content-center">
      <div className="p-4 box">
        <h2 className="mb-3">Shabadavali Signup</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Name"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="role"
              placeholder="Role"
              defaultValue="Creator"
              disabled={true}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">
              Sign up
            </Button>
          </div>
        </Form>
      </div>
      <div className="p-4 box mt-3 text-center" style={{ backgroundColor: '#fff', width: '25%', justifyContent: 'center'}}>
        Already have an account? <Link to="/">Log In</Link>
      </div>
    </div>
  );
};

export default Signup;
