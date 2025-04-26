import React, { useState, useContext } from 'react';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState(user ? user.name : '');
  const navigate = useNavigate();

  if (!user) {
    return <p>You must be logged in to view this page.</p>;
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // In a real application, call an API endpoint to update the profile.
    // For this demo, we update only the name.
    const updatedUser = { ...user, name };
    setUser(updatedUser);
    alert("Profile updated successfully");
  };

  const handleSignOut = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      <h3>Profile</h3>
      <form onSubmit={handleUpdateProfile}>
        <label>Name:</label>
        <br />
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <br />
        <label>Email:</label>
        <br />
        <input type="email" value={user.email} disabled />
        <br />
        <label>Role:</label>
        <br />
        <input type="text" value={user.role} disabled />
        <br />
        <button type="submit">Update Profile</button>
      </form>
      <br />
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default Profile;
