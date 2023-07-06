import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../UserAuthContext";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, user } = useUserAuth();
  let navigate = useNavigate();

  const changeRole = (e: any) => {
    console.log(e.target.value);
    setRole(e.target.value);
  }

  const roles = {
    "creator": "Creator",
    "reviewer": "Reviewer",
    "admin": "Admin"
  }

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError("");
    try {
      await signUp(username, name, role, email, password);
      navigate("/users");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user?.role != "admin") return <h2>Sorry, you are not authorized to view this page.</h2>;
  return (
    <>
      <div className="p-4 box">
        <h2 className="mb-3">Create New User</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="status" onChange={(e) => changeRole(e)}>
            <Form.Label>Role</Form.Label>
            <Form.Select aria-label="Default select example">
              {Object.entries(roles).map((ele, idx) => {
                const [key, value] = ele;
                return (
                  <option key={key} value={key}>{value}</option>
                );
              })}
            </Form.Select>
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
              Create
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default CreateUser;
