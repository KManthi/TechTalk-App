import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import SignUpPage from './SignUpPage';
import UserProfilePage from './UserProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
