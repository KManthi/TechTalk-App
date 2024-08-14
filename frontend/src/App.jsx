import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './components/LandingPage';
import Signup from './components/Signup';
import UserProfilePage from './components/UserProfile';
import Explore from './components/Explore';
import Home from './components/Home';
import Messages from './components/Messages';
import Settings from './components/Settings';
import NotificationsPage from './components/Notifications';
import CreatePost from './components/Post';
import UserSettings from './components/UserSettings';
import Login from './components/Login';

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
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/user-settings" element={<UserSettings />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
