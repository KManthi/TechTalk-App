import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const UserProfile = () => {
    const [activeSection, setActiveSection] = useState(null); 
    const [posts] = useState([
        { id: 1, title: 'First Post' },
        { id: 2, title: 'Second Post' }
    ]);
    const [comments] = useState([
        { id: 1, content: 'Great post!' },
        { id: 2, content: 'Thanks for sharing!' }
    ]);
    const [favorites] = useState([
        { id: 1, title: 'Favorite Post 1' },
        { id: 2, title: 'Favorite Post 2' }
    ]);
    const [profile] = useState({
        profile_picture: 'https://via.placeholder.com/150',
        username: 'JohnDoe',
        bio: 'Software Developer at TechTalk',
        social_links: 'https://github.com/JohnDoe',
        followers_count: 120,
        following_count: 80
    });
    const navigate = useNavigate();

    const handleSettingsClick = () => {
        navigate('/user-settings');
    };

    return (
        <div className='profile-main-container'>
            <NavigationBar />
            <div className='profille-content-container'>
                <div className='user-profile-content'>
                    <div className='profile-info'>
                        <img className='profile-picture' src={profile.profile_picture} alt="Profile" />
                        <h2 className='profile-username'>{profile.username}</h2>
                        <p className='profile-bio'>{profile.bio}</p>
                        <p className='social-links'>
                            Social Links: <a href={profile.social_links} target="_blank" rel="noopener noreferrer">{profile.social_links}</a>
                        </p>
                        <div className='profile-stats'>
                            <p>Followers: {profile.followers_count}</p>
                            <p>Following: {profile.following_count}</p>
                            <button className='edit-profile-btn' onClick={handleSettingsClick}>
                                <FontAwesomeIcon icon={faCog} /> Edit Profile
                            </button>
                        </div>
                    </div>
                    <div className='section-buttons'>
                        <button className={`section-btn ${activeSection === 'posts' ? 'active' : ''}`} onClick={() => setActiveSection('posts')}> Posts</button>
                        <button className={`section-btn ${activeSection === 'comments' ? 'active' : ''}`} onClick={() => setActiveSection('comments')}> Comments</button>
                        <button className={`section-btn ${activeSection === 'favorites' ? 'active' : ''}`} onClick={() => setActiveSection('favorites')}> Favorites</button>
                    </div>
                    <div className='section-content'>
                        {activeSection === 'posts' && (
                            <>
                                <h1>Posts</h1>
                                {posts.length > 0 ? (
                                    <ul>
                                        {posts.map((post) => (
                                            <li key={post.id}>{post.title}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No posts found</p>
                                )}
                            </>
                        )}
                        {activeSection === 'comments' && (
                            <>
                                <h1>Comments</h1>
                                {comments.length > 0 ? (
                                    <ul>
                                        {comments.map((comment) => (
                                            <li key={comment.id}>{comment.content}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No comments found</p>
                                )}
                            </>
                        )}
                        {activeSection === 'favorites' && (
                            <>
                                <h1>Favorites</h1>
                                {favorites.length > 0 ? (
                                    <ul>
                                        {favorites.map((favorite) => (
                                            <li key={favorite.id}>{favorite.title}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No favorites found</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <MessagesBar /> 
        </div>
    );
};

export default UserProfile;
