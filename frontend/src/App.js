import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import HospitalDetails from './components/HospitalDetails';
import Profile from './components/Profile';

export const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div>
          <nav>
            <Link to="/">Dashboard</Link> | <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link>
            {user && (
              <>
                {' '}| <Link to="/profile">Profile</Link> |{' '}
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </nav>
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hospital/:id" element={<HospitalDetails />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
