import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import PostCard from './PostCard';
import MessagesBar from './MessagesBar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const baseUrl = 'https://techtalk-app.onrender.com';

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

                const { user, user_profile } = profileResponse.data.data;

                const socialLinks = JSON.parse(user_profile.social_links);

                setProfile({
                    ...user,
                    ...user_profile,
                    social_links: socialLinks
                });

                setLoading(false);
            } catch (error) {
                setError('Failed to load data');
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${baseUrl}/myposts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(response.data);
        } catch (error) {
            setError('Failed to fetch posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

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
                                <img className='profile-picture' src={profile.profile_pic || 'https://via.placeholder.com/150'} alt="Profile" />
                                <h2 className='profile-username'>{profile.username}</h2>
                                <p className='profile-bio'>{profile.bio}</p>
                                <p className='social-links'>
                                    Social Links: {profile.social_links && profile.social_links.length > 0 ? (
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
                                {posts.map(post => (
                                    <div key={post.id} className='my-post-card'>
                                        <div className='post-header'>
                                            <img 
                                                src={post.author_profile_pic || 'https://via.placeholder.com/150'} 
                                                alt={post.author || 'Profile picture'} 
                                                className='profile-pic' 
                                            />
                                            <h2 onClick={() => handlePostTitleClick(post.id)}>
                                                {post.title}
                                            </h2>
                                            <div className='post-category'>{post.category_name}</div>
                                        </div>
                                        <p>{post.content}</p>
                                        <div className='small-block'>
                                            <small>Posted by {post.author} on {new Date(post.created_at).toLocaleString()}</small>
                                        </div>
                                        <PostCard
                                            post={post}
                                            fetchPosts={fetchPosts}
                                        />
                                        {post.isExpanded && (
                                            <div className='expanded-content'>
                                                <div className='comment-section'>
                                                    <h3>Comments ({post.comments_count || 0})</h3>
                                                    {(Array.isArray(post.comments) ? post.comments : []).map((comment, index) => (
                                                        <div key={index} className='comment'>
                                                            <p><strong>{comment.user}:</strong> {comment.content}</p>
                                                            <small>{new Date(comment.created_at).toLocaleString()}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>   
                                ))}
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
