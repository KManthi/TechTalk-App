import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import Signup from './components/Signup';
import UserProfilePage from './components/UserProfilePage';
import Explore from './components/Explore';
import Home from './components/Home';
import Messages from './components/Messages';
import Settings from './components/Settings';
import NotificationsPage from './components/Notifications';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />        
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/home" element={<Home />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
