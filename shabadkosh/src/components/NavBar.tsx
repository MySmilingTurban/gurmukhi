import React from 'react';
import { Nav } from 'react-bootstrap';

import { Navbar, NavDropdown, Container } from 'react-bootstrap';
import { useUserAuth } from './UserAuthContext';

const NavBar = (props: any) => {
  const {user} = useUserAuth();

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/home">ShabadKosh</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/home">Home</Nav.Link>
              <NavDropdown
                title="Words"
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item href="/words" >All words</NavDropdown.Item>
                <NavDropdown.Item href="/create">Add Word</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown
                title="Wordlists"
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item href="/wordlists" >All wordlists</NavDropdown.Item>
                <NavDropdown.Item href="/wordlists/new">Add Wordlist</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/search">Search</Nav.Link>
              <Nav.Link href="/about">About</Nav.Link>
              <Nav.Link href="/contact">Contact</Nav.Link>
              <NavDropdown title={user?.role == 'admin' ? 'Users' : 'User'} id="basic-nav-dropdown-1">
                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item href="/users" hidden={user?.role != 'admin'}>View Users</NavDropdown.Item>
                {/* <NavDropdown.Item href="/settings">Settings</NavDropdown.Item> */}
                <NavDropdown.Divider />
                <NavDropdown.Item href="/login" hidden={user?.uid}>Log in</NavDropdown.Item>
                <NavDropdown.Item href="/logout" hidden={!user?.uid}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
