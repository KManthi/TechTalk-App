import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPen, faUser, faCompass, faBell, faEnvelope, faHome, faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import "../styles.css";

const NavigationBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            <div className={`side-nav ${isCollapsed ? 'collapsed' : ''}`}>
                {!isCollapsed && (
                    <ul>
                        <li>
                            <Link to="/home">
                                <FontAwesomeIcon icon={faHome} /> Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile">
                                <FontAwesomeIcon icon={faUser} /> Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/explore">
                                <FontAwesomeIcon icon={faCompass} /> Explore
                            </Link>
                        </li>
                        <li>
                            <Link to="/create-post">
                                <FontAwesomeIcon icon={faPen} /> Post
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <FontAwesomeIcon icon={faCog} /> Settings
                            </Link>
                        </li>
                        <li>
                            <Link to="/messages">
                                <FontAwesomeIcon icon={faEnvelope} /> Messages
                            </Link>
                        </li>
                        <li>
                            <Link to="/notifications">
                                <FontAwesomeIcon icon={faBell} /> Notifications
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
            <button className="toggle-button" onClick={toggleCollapse}>
                <FontAwesomeIcon icon={isCollapsed ? faArrowCircleRight : faArrowCircleLeft} />
            </button>
        </>
    );
};

export default NavigationBar;
