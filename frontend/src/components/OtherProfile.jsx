import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 

const baseUrl = 'http://127.0.0.1:5555';

const OtherUserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate(); // Hook for navigation
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

                // Fetch posts, comments, and favorites if needed
                // const postsResponse = await axios.get(`${baseUrl}/userposts`, { headers: { 'Authorization': `Bearer ${token}` } });
                // setPosts(postsResponse.data.posts);
                // const commentsResponse = await axios.get(`${baseUrl}/usercomments`, { headers: { 'Authorization': `Bearer ${token}` } });
                // setComments(commentsResponse.data.comments);
                // const favoritesResponse = await axios.get(`${baseUrl}/userfavorites`, { headers: { 'Authorization': `Bearer ${token}` } });
                // setFavorites(favoritesResponse.data.favorites);

                setLoading(false);
            } catch (error) {
                setError('Failed to load data');
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

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

export default OtherUserProfile;
