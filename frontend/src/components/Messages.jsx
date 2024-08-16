import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'John Doe',
      profilePic: 'https://via.placeholder.com/50',
      body: 'Hey, I was wondering if you could help me with a React issue...',
      timestamp: new Date(),
      read: false,
    },
    {
      id: 2,
      sender: 'Jane Smith',
      profilePic: 'https://via.placeholder.com/50',
      body: 'Let\'s catch up sometime next week!',
      timestamp: new Date(),
      read: true,
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const navigate = useNavigate();

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    const updatedMessages = messages.map((msg) =>
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    
  };

  return (
    <div className="messages-container">
      <div className='back-home-container'>
      <button className="back-home btn btn-lg text-uppercase animate_btn" onClick={() => navigate('/home')}>
        Home
      </button>
      </div>
      <div className="messages-subcontainer">
        <h1>Inbox</h1>
        <div className="messages-content">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${message.read ? 'read' : 'unread'}`}
              onClick={() => handleOpenMessage(message)}
            >
              <img src={message.profilePic} alt={`${message.sender}'s Profile`} className="profile-pic" />
              <div className="message-text-container">
                <div className="message-username">{message.sender}</div>
                <div className="message-text">{message.body}</div>
                <div className="message-timestamp">{message.timestamp.toLocaleString()}</div>
              </div>
              </div>
               ))}
        </div>
        </div>
    </div>
  );
};
export default Messages;
