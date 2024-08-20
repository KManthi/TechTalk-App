import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 
import Spinner from './Spinner'; 
import '../styles.css';

const baseUrl = 'http://127.0.0.1:5555';
const defaultProfilePic = 'https://via.placeholder.com/150';

const FollowersList = () => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchFollowers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');
                
                const response = await axios.get(`${baseUrl}/myfollowers`, {
                    params: {
                        page,
                        per_page: 10
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (isMounted) {
                    setFollowers(prevFollowers => [...prevFollowers, ...response.data]);
                    setLoading(false);
                    setHasMore(response.data.length === 10);
                }
            } catch (error) {
                if (isMounted) {
                    setError('Failed to load followers');
                    setLoading(false);
                }
            }
        };

        fetchFollowers();

        return () => {
            isMounted = false;
        };
    }, [page]);

    const navigateToUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    if (loading) return <Spinner />;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='followers-list-container'>
            <NavigationBar />
            <div className='content-container'>
                <button className='follow-back-button' onClick={() => navigate('/profile')}>Back to Profile</button>
                <h1 className='follow-h1'>Followers</h1>
                {followers.length > 0 ? (
                    <ul className='user-list'>
                        {followers.map(follower => (
                            <li key={follower.id} className='following-card' onClick={() => navigateToUserProfile(follower.id)}>
                                <img 
                                    src={follower.profile_pic || defaultProfilePic}
                                    alt={follower.username}
                                    className='user-profile-pic'
                                />
                                <span>{follower.username}</span>
                                <button onClick={(e) => e.stopPropagation()}>Follow/Unfollow</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No followers found</p>
                )}
                {hasMore && (
                    <button onClick={() => setPage(prevPage => prevPage + 1)}>Load More</button>
                )}
            </div>
            <MessagesBar />
        </div>
    );
};

export default FollowersList;
