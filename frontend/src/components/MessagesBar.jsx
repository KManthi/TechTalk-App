import React, { useState } from 'react';
import '../styles.css';

const MessagesBar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleMessagesBar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`messages-bar ${isExpanded ? 'expanded' : ''}`}>
            <div className="messages-bar-header" onClick={toggleMessagesBar}>
                Messages
            </div>
            <div className="messages-content">
                {/* Add your messages content here */}
                <p>Your messages will appear here...</p>
            </div>
        </div>
    );
};

export default MessagesBar;
