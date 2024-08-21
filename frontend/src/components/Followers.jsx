import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 
import Spinner from './Spinner'; 
import '../styles.css';

const baseUrl = 'https://techtalk-app.onrender.com';
const defaultProfilePic = 'https://via.placeholder.com/150';

const FollowersList = () => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');
                
                const response = await axios.get(`${baseUrl}/myfollowers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setFollowers(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load followers');
                setLoading(false);
            }
        };

        fetchFollowers();
    }, []);

    const navigateToUserProfile = (userId) => {
        navigate(`/userprofiles/${userId}`);
    };

    const handleFollowUnfollow = async (e, followedUserId, isFollowed) => {
        e.stopPropagation(); 
        const token = localStorage.getItem('access_token');
        if (!token) return; 

        try {
            const url = isFollowed ? `${baseUrl}/unfollow` : `${baseUrl}/follow`;
            const method = isFollowed ? 'delete' : 'post';
            const payload = isFollowed ? { data: { followed_user_id: followedUserId } } : { followed_user_id: followedUserId };

            await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                ...(isFollowed && payload),
                ...(!isFollowed && { data: payload }),
            });

            setFollowers(prevFollowers =>
                prevFollowers.map(follower =>
                    follower.id === followedUserId ? { ...follower, is_followed: !isFollowed } : follower
                )
            );
        } catch (error) {
            console.error('Failed to follow/unfollow user', error);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='followers-list-container'>
            <NavigationBar />
            <div className='content-container'>
                <button className='follow-back-button' onClick={() => navigate('/profile')}>Profile</button>
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
                                <button 
                                    onClick={(e) => handleFollowUnfollow(e, follower.id, follower.is_followed)}
                                >
                                    {follower.is_followed ? 'Unfollow' : 'Follow'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No followers found</p>
                )}
            </div>
            <MessagesBar />
        </div>
    );
};

export default FollowersList;
