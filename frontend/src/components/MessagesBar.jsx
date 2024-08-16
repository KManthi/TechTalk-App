import React, { useState } from 'react';
import '../styles.css';

const MessagesBar = ({ onSelectMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const messages = [
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
    ];

    const toggleMessagesBar = () => {
        setIsExpanded(!isExpanded);
    };

    const handleMessageClick = (message) => {
        if (onSelectMessage) {
            onSelectMessage(message);
        }
    };

    return (
        <div className={`messages-bar ${isExpanded ? 'expanded' : ''}`}>
            <div className="messages-bar-header" onClick={toggleMessagesBar}>
                Messages
                <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>
                    {isExpanded ? '▼' : '▲'}
                </span>
            </div>
            <div className="messages-content">
                {isExpanded ? (
                    messages.length > 0 ? (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-bar-item ${message.read ? 'read' : 'unread'}`}
                                onClick={() => handleMessageClick(message)}
                            >
                                <img src={message.profilePic} alt={`${message.sender}'s Profile`} className="profile-pic" />
                                <div className="message-text-container">
                                    <div className="message-username">{message.sender}</div>
                                    <div className="message-text">
                                        {message.body.length > 30 ? `${message.body.substring(0, 30)}...` : message.body}
                                    </div>
                                    <div className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Your messages will appear here...</p>
                    )
                ) : (
                    <p>Expand to see your messages...</p>
                )}
            </div>
        </div>
    );
};
export default MessagesBar;