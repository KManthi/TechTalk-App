import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import axios from 'axios';

const Settings = () => {
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollowers, setNotifyFollowers] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');
  const [theme, setTheme] = useState('system');
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [categories, setCategories] = useState({
    sports: true,
    technology: true,
    music: false,
  });

  const navigate = useNavigate(); 

  useEffect(() => {
    if (theme === 'system') {
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.className = prefersDarkScheme ? 'dark-theme' : 'light-theme';
    } else {
      document.body.className = `${theme}-theme`;
    }
  }, [theme]);

  const handleCategoryChange = (category) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      [category]: !prevCategories[category],
    }));
  };

  const handleSaveSettings = async () => {
    const settings = {
      notificationsEnabled,
      notifyLikes,
      notifyComments,
      notifyFollowers,
      notifyMessages,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      theme,
      sensitiveContent,
      categories,
    };

    try {
      const response = await axios.post('http://localhost:3000/settings', settings);
      console.log(response.data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="full-container">
      <div className="home-button">
        <button className="back-home btn btn-lg text-uppercase animate_btn" onClick={() => navigate('/home')}>
          Home
        </button>
      </div>
      <div className="settings">
        <h1>Settings</h1>

        {/* Notification Settings */}
        <div className="notification-settings">
          <h2>Notification Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            Enable Push Notifications
          </label>
          <div className="notification-customization">
            <h3>Notification Preferences</h3>
            <label>
              <input
                type="checkbox"
                checked={notifyLikes}
                onChange={() => setNotifyLikes(!notifyLikes)}
              />
              Likes
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyComments}
                onChange={() => setNotifyComments(!notifyComments)}
              />
              Comments
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyFollowers}
                onChange={() => setNotifyFollowers(!notifyFollowers)}
              />
              New Followers
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={() => setNotifyMessages(!notifyMessages)}
              />
              Messages
            </label>
          </div>
          <div className="quiet-hours">
            <h3>Quiet Hours</h3>
            <label>
              Start Time:
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={() => setQuietHoursEnabled(!quietHoursEnabled)}
              />
              Enable Quiet Hours Manually
            </label>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="appearance-settings">
          <h2>Appearance Settings</h2>
          <label>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
            />
            Light Theme
          </label>
          <label>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
            />
            Dark Theme
          </label>
          <label>
            <input
              type="radio"
              name="theme"
              value="system"
              checked={theme === 'system'}
              onChange={() => setTheme('system')}
            />
            System Default
          </label>
        </div>

        {/* Content Preferences */}
        <div className="content-preferences">
          <h2>Content Preferences</h2>
          <label>
            <input
              type="checkbox"
              checked={sensitiveContent}
              onChange={() => setSensitiveContent(!sensitiveContent)}
            />
            Filter Sensitive Content
          </label>
          <div className="content-categories">
            <h3>Content Categories</h3>
            {Object.keys(categories).map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={categories[category]}
                  onChange={() => handleCategoryChange(category)}
                />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="save-settings">
          <button className="btn btn-lg btn_style text-uppercase animate_btn" onClick={handleSaveSettings}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
