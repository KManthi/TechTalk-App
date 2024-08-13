import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://techtalk-app.onrender.com/api/messages');
        setMessages(response.data);
      } catch (error) {
        setError('Failed to fetch messages.');
      } finally {
        setLoading(false); // Stop loading once the request is complete
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
        <div className="messages-container">
          <button className="back-home btn btn-lg text-uppercase animate_btn" onClick={() => navigate('/')}>
            Home
          </button>
          
          <div className="container">
          <h1>Inbox</h1>
            <div className="news-container1">
              <div className="news-headline1">
                MESSAGES
              </div> 
              
              </div>
             </div>
        

      {loading ? ( // Display "No messages found" and loading state before messages are fetched
       
        <div>
        <p>No messages found.</p>
          <p>Loading messages...</p>
        </div>
        
        
      ) : error ? (
        <p className="error">{error}</p>
      ) : !selectedMessage ? (
        <div className="inbox">
          <div className="jumbotron">
            <div className="container">
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
          </div>
        </div>
        
  
      ) : (
        <div className="jumbotron">
          <div className="container">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
