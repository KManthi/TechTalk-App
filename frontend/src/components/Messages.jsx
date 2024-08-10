import React, { useState } from 'react';
import './Messages.css';

const Messages = ({ messages, onReply }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    const updatedMessages = messages.map((msg) =>
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
  };

  const handleReply = () => {
    if (selectedMessage && onReply) {
      if (replyContent.trim() === '') {
        setError('Reply content cannot be empty.');
        return;
      }
      onReply(selectedMessage.id, replyContent);
      setReplyContent('');
      setError('');
    }
  };

  const handleMarkAsUnread = (message) => {
    const updatedMessages = messages.map((msg) =>
      msg.id === message.id ? { ...msg, read: false } : msg
    );
    setMessages(updatedMessages);
    setSelectedMessage(null);
  };

  return (
    <div className="messages-container">
      <button onClick={() => setSelectedMessage(null)}>Back to Inbox</button>

      {!selectedMessage ? (
        <div className="inbox">
          <h2>Inbox</h2>
          {messages.map((message) => (
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
          ))}
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
