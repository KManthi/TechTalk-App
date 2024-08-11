import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import Signup from './components/Signup';
import UserProfilePage from './components/UserProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
