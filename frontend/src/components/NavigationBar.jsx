import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome as igloo, faUser as bountyHunter, faRecordVinyl as albumCollection, faPenToSquare as writeToFile, faSliders as sliders, faEnvelope as mailbox, faBell as bell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import "../index.css";

const NavigationBar = () => {
    return (
        <div className="navbar-container"> {/* Updated container class */}
            <nav className="navigation-bar">
                <ul>
                    <li>
                        <Link to="/home">
                            <FontAwesomeIcon icon={igloo} size="lg" />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile">
                            <FontAwesomeIcon icon={bountyHunter} size="lg" />
                            <span>Profile</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/explore">
                            <FontAwesomeIcon icon={albumCollection} size="lg" />
                            <span>Explore</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/create-post">
                            <FontAwesomeIcon icon={writeToFile} size="lg" />
                            <span>Post</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings">
                            <FontAwesomeIcon icon={sliders} size="lg" />
                            <span>Settings</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/messages">
                            <FontAwesomeIcon icon={mailbox} size="lg" />
                            <span>Messages</span>
                            {/* notification badge here */}
                        </Link>
                    </li>
                    <li>
                        <Link to="/notifications">
                            <FontAwesomeIcon icon={bell} size="lg" />
                            <span>Notifications</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default NavigationBar;
