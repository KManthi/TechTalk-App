import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import PostCard from './PostCard';  // Import PostCard to match layout
import MessagesBar from './MessagesBar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const baseUrl = 'http://127.0.0.1:5555';

const OtherUserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeSection, setActiveSection] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');

                const profileResponse = await axios.get(`${baseUrl}/userprofiles/${userId}`, {
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

                fetchPosts();  // Fetch posts after profile data is set
                
                // If needed, fetch comments and favorites here

                setLoading(false);
            } catch (error) {
                setError('Failed to load data');
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${baseUrl}/users/${userId}/posts`, {
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

    const handleGoBack = () => {
        navigate(-1); // Navigate back to the previous page
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
                <button onClick={handleGoBack} className='prof-back-button'>Back</button>
                <div className='user-profile-content'>
                    <div className='profile-info'>
                        {profile && (
                            <>
                                <img className='profile-picture' src={profile.profile_pic || 'https://via.placeholder.com/150'} alt="Profile" />
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
                                    <div className='profile-stats-item'>
                                        Followers: {profile.followers_count}
                                    </div>
                                    <div className='profile-stats-item'>
                                        Following: {profile.following_count}
                                    </div>
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

export default OtherUserProfile;
