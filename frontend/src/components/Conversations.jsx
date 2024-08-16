import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Conversations = () => {
  const { messageId } = useParams();
  const [conversation, setConversation] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://127.0.0.1:5555/users/me/conversations/${messageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setConversation(response.data);
      } catch (error) {
        setError('Failed to fetch conversation.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [messageId]);

  const handleReply = async () => {
    if (replyContent.trim() === '') {
      setError('Reply content cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`https://techtalk-app.onrender.com/api/messages/${messageId}/reply`, {
        content: replyContent,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReplyContent('');
      setError('');
      fetchConversation(); // Refresh the conversation after replying
    } catch (error) {
      setError('Failed to send reply.');
    }
  };

  return (
    <div className="conversation-container">
      <button className="back-inbox btn btn-lg text-uppercase animate_btn" onClick={() => navigate('/messages')}>
        Back to Inbox
      </button>

      <div className="container">
        <h1>Conversation</h1>
        {loading ? (
          <p>Loading conversation...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="conversation">
            {conversation.map((message) => (
              <div key={message.id} className={`message-item ${message.sender === 'me' ? 'my-message' : 'their-message'}`}>
                <strong>{message.sender}</strong>
                <p>{message.content}</p>
                <span>{new Date(message.timestamp).toLocaleString()}</span>
              </div>
            ))}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
