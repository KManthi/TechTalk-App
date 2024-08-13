import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://techtalk-app.onrender.com/notifications?page=${page}`);
      const newNotifications = response.data;

      setNotifications(prev => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length > 0);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  
  const markAsRead = async (id) => {
    try {
      await axios.patch(`https://techtalk-app.onrender.com/notifications/${id}`, { read: true });
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };


  const handleLoadMore = () => {
    const nextPage = Math.ceil(notifications.length / 10) + 1;
    fetchNotifications(nextPage);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-page">
      <header>
        <button className="back-home btn btn-lg text-uppercase animate_btn" onClick={() => navigate('/')}>Home</button>
      </header>
      <div className="jumbotron">
            <div className="container">
            <div class="news-container">
                <div class="news-headline">
                  NOTIFICATION
                </div> 
            </div>
              {error && <p className="error">{error}</p>}
              {notifications.length === 0 && !loading && <p>No notifications yet.</p>}
              <InfiniteScroll
                dataLength={notifications.length}
                next={handleLoadMore}
                hasMore={hasMore}
                loader={<div class="loading-container">
                  <span class="loading-text">Loading</span>
                  <span class="dot">.</span>
                  <span class="dot">.</span>
                  <span class="dot">.</span>
              </div>}
              >
                <ul>
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      style={{ backgroundColor: notification.read ? 'white' : '#f0f0f0' }}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div>
                        <strong>{notification.user}</strong>
                        {notification.type === 'comment' && <p>{notification.content}</p>}
                        <p>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            </div>
            </div>
            </div>
          );
        };

    export default NotificationsPage;
