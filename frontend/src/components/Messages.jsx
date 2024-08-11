import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://techtalk-app.onrender.com/api/messages');
        setMessages(response.data);
      } catch (error) {
        setError('Failed to fetch messages.');
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

  const handleBackToHome = () => {
    setSelectedMessage(null);
    navigate('/home');
  };

  return (
    <div className="messages-container">
      <button onClick={handleBackToHome}>Back to Home</button>

      {!selectedMessage ? (
        <div className="inbox">
          <h2>Inbox</h2>
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-preview ${message.read ? '' : 'unread'}`}
                onClick={() => handleOpenMessage(message)}
              >
                <p>
                  <strong>{message.sender}</strong>
                  <span>{message.subject || 'No Subject'}</span>
                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                </p>
              </div>
            ))
          ) : (
            <p>No messages found.</p>
          )}
        </div>
      ) : (
        <div className="message-view">
          <h2>Message from {selectedMessage.sender}</h2>
          <p>
            <strong>Received:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}
          </p>
          <div>{selectedMessage.body}</div>

          <div className="reply-section">
            <textarea
              placeholder="Type your reply here..."
              rows="4"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button onClick={handleReply}>Send Reply</button>
            {error && <div className="error">{error}</div>}
          </div>

          <button onClick={() => handleMarkAsUnread(selectedMessage)}>Mark as Unread</button>
        </div>
      )}
    </div>
  );
};

export default Messages;