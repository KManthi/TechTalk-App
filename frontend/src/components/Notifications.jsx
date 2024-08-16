import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import NavigationBar from './NavigationBar';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:5555/notifications?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newNotifications = response.data;

      setNotifications((prev) => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length > 0);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://127.0.0.1:5555/notifications/${id}`, { read: true });
      setNotifications((prev) =>
        prev.map((notification) =>
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
    <div className="whatsapp-page">
      <NavigationBar />

      <div className="whatsapp-notifications">
        <div className="whatsapp-title">
          <h2>Notifications</h2>
        </div>

        {error && <p className="whatsapp-error">{error}</p>}

        {notifications.length === 0 && !loading && (
          <p className="whatsapp-no-notifications">No notifications yet.</p>
        )}

        <InfiniteScroll
          dataLength={notifications.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={
            <div className="whatsapp-loading">
              <div className="whatsapp-loader"></div>
            </div>
          }
        >
          <ul className="whatsapp-notifications-list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`whatsapp-notification-item ${
                  notification.read ? 'whatsapp-read' : 'whatsapp-unread'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="whatsapp-profile-container">
                  <faUserCircle className="whatsapp-profile-icon" />
                </div>
                <div className="whatsapp-message-container">
                  <strong>{notification.user}</strong>
                  <p className="whatsapp-message">
                    {notification.type === 'like'
                      ? `liked your post`
                      : notification.type === 'comment'
                      ? `left a comment: ${notification.content}`
                      : `Notification type not recognized`}
                  </p>
                  <p className="whatsapp-timestamp">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default NotificationsPage;
