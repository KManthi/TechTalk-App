import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const baseUrl = 'http://127.0.0.1:5555';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeSection, setActiveSection] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');
                
                const profileResponse = await axios.get(`${baseUrl}/my-profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Extract user and user_profile data from response
                const { user, user_profile } = profileResponse.data.data;

                // Parse social links JSON string into an array
                const socialLinks = JSON.parse(user_profile.social_links);

                // Set profile state
                setProfile({
                    ...user,
                    ...user_profile,
                    social_links: socialLinks
                });

                // Fetch posts, comments, and favorites (commented out)
                // const postsResponse = await axios.get(`${baseUrl}/userposts`, {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     }
                // });
                // setPosts(postsResponse.data.posts);

                // const commentsResponse = await axios.get(`${baseUrl}/usercomments`, {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     }
                // });
                // setComments(commentsResponse.data.comments);

                // const favoritesResponse = await axios.get(`${baseUrl}/userfavorites`, {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     }
                // });
                // setFavorites(favoritesResponse.data.favorites);

                setLoading(false);
            } catch (error) {
                setError('Failed to load data');
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSettingsClick = () => {
        navigate('/user-settings');
    };

    const handleFollowersClick = () => {
        navigate('/followers');
    };

    const handleFollowingClick = () => {
        navigate('/following');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='profile-main-container'>
            <NavigationBar />
            <div className='profile-content-container'>
                <div className='user-profile-content'>
                    <div className='profile-info'>
                        {profile && (
                            <>
                                <img className='profile-picture' src={profile.profile_pic} alt="Profile" />
                                <h2 className='profile-username'>{profile.username}</h2>
                                <p className='profile-bio'>{profile.bio}</p>
                                <p className='social-links'>
                                    Social Links: {profile.social_links.length > 0 ? (
                                        profile.social_links.map((link, index) => (
                                            <span key={index}>
                                                <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                                {index < profile.social_links.length - 1 && ', '}
                                            </span>
                                        ))
                                    ) : (
                                        'No social links available'
                                    )}
                                </p>
                                <div className='profile-stats'>
                                    <div className='profile-stats-item' onClick={handleFollowersClick}>
                                        Followers: {profile.followers_count}
                                    </div>
                                    <div className='profile-stats-item' onClick={handleFollowingClick}>
                                        Following: {profile.following_count}
                                    </div>
                                    <button className='edit-profile-btn' onClick={handleSettingsClick}>
                                        <FontAwesomeIcon icon={faCog} /> Edit Profile
                                    </button>
                                </div>
                            </>
                        )}
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
