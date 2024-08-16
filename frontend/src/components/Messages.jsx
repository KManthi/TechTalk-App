import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:5555/users/me/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessages(response.data);
      } catch (error) {
        setError('Failed to fetch messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    const updatedMessages = messages.map((msg) =>
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    updateMessageStatus(message.id, true);
  };

  const updateMessageStatus = async (messageId, readStatus) => {
    try {
      await axios.post(`https://techtalk-app.onrender.com/api/messages/${messageId}/status`, {
        read: readStatus,
      });
    } catch (error) {
      setError('Failed to update message status.');
    }
  };

  const handleReply = async () => {
    if (selectedMessage) {
      if (replyContent.trim() === '') {
        setError('Reply content cannot be empty.');
        return;
      }

      try {
        await axios.post(`https://techtalk-app.onrender.com/api/messages/${selectedMessage.id}/reply`, {
          content: replyContent,
        });
        setReplyContent('');
        setError('');
      } catch (error) {
        setError('Failed to send reply.');
      }
    }
  };

  const handleMarkAsUnread = async (message) => {
    try {
      await axios.post(`https://techtalk-app.onrender.com/api/messages/${message.id}/mark-unread`);
      const updatedMessages = messages.map((msg) =>
        msg.id === message.id ? { ...msg, read: false } : msg
      );
      setMessages(updatedMessages);
      setSelectedMessage(null);
    } catch (error) {
      setError('Failed to mark message as unread.');
    }
  };

  return (
    <div className="messages-page">
      <header className="messages-header">
        <button className="messages-back-button" onClick={() => navigate('/home')}>
          Back
        </button>
        <h1 className="messages-title">Inbox</h1>
      </header>

      {loading ? (
        <div className="messages-loading">
          <div className="messages-loader"></div>
          <p>Loading messages...</p>
        </div>
      ) : error ? (
        <p className="messages-error">{error}</p>
      ) : !selectedMessage ? (
        <div className="messages-container">
          {messages.length > 0 ? (
            <ul className="message-list">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`message-item ${message.read ? '' : 'unread'}`}
                  onClick={() => handleOpenMessage(message)}
                >
                  <div className="message-avatar">
                    {message.sender.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-details">
                    <p className="message-sender">{message.sender}</p>
                    <p className="message-subject">{message.subject || 'No Subject'}</p>
                    <p className="message-timestamp">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="messages-no-messages">No messages found.</p>
          )}
        </div>
      ) : (
        <div className="messages-container">
          <div className="message-details">
            <h2>Message from {selectedMessage.sender}</h2>
            <p className="message-timestamp">
              Received: {new Date(selectedMessage.timestamp).toLocaleString()}
            </p>
            <div className="message-body">{selectedMessage.body}</div>

            <div className="reply-section">
              <textarea
                className="reply-textarea"
                placeholder="Type your reply here..."
                rows="4"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button className="reply-button" onClick={handleReply}>Send Reply</button>
              {error && <div className="messages-error">{error}</div>}
            </div>

            <button className="messages-back-button" onClick={() => handleMarkAsUnread(selectedMessage)}>Mark as Unread</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
