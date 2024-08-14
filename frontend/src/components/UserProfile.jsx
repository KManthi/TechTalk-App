import React, { useState, useEffect } from 'react';  // Removed useEffect import
import { useNavigate, useParams } from 'react-router-dom'; 
import axios from 'axios';
import NavigationBar from './NavigationBar';

const baseUrl = 'http://127.0.0.1:5555/';

const UserProfile = () => {
    const [activeSection, setActiveSection] = useState(null); 
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    // Temporarily disabled fetching profile
    
    // useEffect(() => {
    //     const fetchUserProfile = async () => {
    //         setLoading(true);
    //         try {
    //             const token = localStorage.getItem('access_token');
    //             if (!token) {
    //                 throw new Error('No auth token found');
    //             }

    //             const response = await axios.get(`${baseUrl}/my-profile`, {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`
    //                 }
    //             });
    //             setProfile(response.data.user_profile);
    //         } catch (error) {
    //             setError('Failed to fetch profile.');
    //             console.error('Error fetching profile:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchUserProfile();
    // }, [id]);
    

    // Temporarily disabled fetching posts
    /*
    useEffect(() => {
        if (activeSection === 'posts') {
            const fetchMyPosts = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('access_token');
                    if (!token) {
                        throw new Error('No auth token found');
                    }

                    const response = await axios.get(`${baseUrl}/my-posts`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setPosts(response.data);
                } catch (error) {
                    setError('Failed to fetch posts.');
                    console.error('Error fetching posts:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMyPosts();
        }
    }, [activeSection]);
    */

    // Temporarily disabled fetching comments
    /*
    const fetchMyComments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            const response = await axios.get(`${baseUrl}/my-comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setComments(response.data);
        } catch (error) {
            setError('Failed to fetch comments.');
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };
    */

    // Temporarily disabled fetching favorites
    /*
    const fetchMyFavorites = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            const response = await axios.get(`${baseUrl}/users/me/favourites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFavorites(response.data);
        } catch (error) {
            setError('Failed to fetch favorites.');
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };
    */

    const handleSettingsClick = () => {
        navigate('/user-settings');
    };

    // Temporarily disabled section fetching
    /*
    const handleSectionClick = (section) => {
        setActiveSection(section);
        if (section === 'comments') {
            fetchMyComments();
        } else if (section === 'favorites') {
            fetchMyFavorites();
        }
    };
    */

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='user-profile-container'>
            <NavigationBar />
            <div className='user-profile-content'>
                <button onClick={handleSettingsClick}>Edit Profile</button>
                {profile && (
                    <div>
                        <img src={profile.profile_picture} alt="Profile" />
                        <h2>{profile.username}</h2>
                        <p>{profile.bio}</p>
                        <p>
                            Social Links: <a href={profile.social_links}>{profile.social_links}</a>
                            </p>
                            <div>
                                <p>Followers: {profile.followers_count}</p>
                                <p>Following: {profile.following_count}</p>
                                </div>
                                </div>
                            )}
                            <div>
                                <button onClick={() => setActiveSection('posts')}>My Posts</button>
                                <button onClick={() => setActiveSection('comments')}>My Comments</button>
                                <button onClick={() => setActiveSection('favorites')}>My Favorites</button>
                                </div>
                                <div>
                                    {activeSection === 'posts' && (
                                        <>
                                        <h1>My Posts</h1>
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
                                                    <h1>My Comments</h1>
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
                                                    <h1>My Favorites</h1>
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
                    );
                };

export default UserProfile;
