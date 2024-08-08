import React, { useState, useEffect } from 'react';

const Messages = ({ messages, onReply }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    message.read = true;
  };

  const handleReply = (replyContent) => {
    if (selectedMessage && onReply) {
      onReply(selectedMessage.id, replyContent);
    }
  };

  const handleMarkAsUnread = (message) => {
    message.read = false;
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
          <p><strong>Received:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</p>
          <div>{selectedMessage.body}</div>

          <div className="reply-section">
            <textarea
              placeholder="Type your reply here..."
              rows="4"
            />
            <button onClick={() => handleReply(document.querySelector('textarea').value)}>Send Reply</button>
          </div>

          <button onClick={() => handleMarkAsUnread(selectedMessage)}>Mark as Unread</button>
        </div>
      )}
    </div>
  );
};

export default Messages;
