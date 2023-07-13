import React from 'react';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserAuthContextProvider } from './components/UserAuthContext';
import { Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Signup from './components/auth/Signup';
import About from './components/About';
import Contact from './components/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Search from './components/Search';
import Profile from './components/user/Profile';
import ViewDictionary from './components/words/ViewDictionary';
import WordDetail from './components/words/WordDetail';
import AddWord from './components/words/AddWord';
import EditWord from './components/words/EditWord';
import Users from './components/user/Users';
import AddWordlist from './components/wordlists/AddWordlist';
import Wordlists from './components/wordlists/Wordlists';
import EditWordlist from './components/wordlists/EditWordlist';
import ViewWordlist from './components/wordlists/ViewWordlist';
import EditUser from './components/user/EditUser';

function App() {
  return (
    <div className="App">
      <UserAuthContextProvider>
        <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<Login />}/>

          {/* auth */}
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
          <Route path="/signup" element={<Signup />}/>

          {/* general */}
          <Route path="/about" element={<About />}/>
          <Route path="/contact" element={<Contact />}/>
          
          {/* Protected ie AuthNeeded */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          {/* user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/edit/:uid"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          /> */}

          {/* words */}
          <Route
            path="/words"
            element={
              <ProtectedRoute>
                <ViewDictionary />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/words/:wordid"
            element={
              <ProtectedRoute>
                <WordDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <AddWord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:wordid"
            element={
              <ProtectedRoute>
                <EditWord />
              </ProtectedRoute>
            }
          />

          {/* wordlists */}
          <Route
            path="/wordlists"
            element={
              <ProtectedRoute>
                <Wordlists />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wordlists/:wlid"
            element={
              <ProtectedRoute>
                <ViewWordlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wordlists/new"
            element={
              <ProtectedRoute>
                <AddWordlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wordlists/edit/:wlid"
            element={
              <ProtectedRoute>
                <EditWordlist />
              </ProtectedRoute>
            }
          />

          {/* The 404 page */}
          <Route path="*" element={<h1>404 Not Found</h1>}/>
        </Routes>
        </div>
        </UserAuthContextProvider>
    </div>
  );
}

export default App;
