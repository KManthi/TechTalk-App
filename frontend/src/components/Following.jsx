import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import MessagesBar from './MessagesBar'; 
import Spinner from './Spinner'; 
import '../styles.css';

const baseUrl = 'https://techtalk-app.onrender.com';
const defaultProfilePic = 'https://via.placeholder.com/150';

const FollowingList = () => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');
                
                const response = await axios.get(`${baseUrl}/myfollowing`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setFollowing(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load following');
                console.error('Error fetching following:', error);
                setLoading(false);
            }
        };

        fetchFollowing();
    }, []);

    const handleUnfollow = async (userId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');
            
            await axios.delete(`${baseUrl}/unfollow`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    followed_user_id: userId
                }
            });

            setFollowing(following.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const navigateToUserProfile = (userId) => {
        navigate(`/userprofiles/${userId}`);
    };

    if (loading) return <Spinner />;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='following-list-container'>
            <NavigationBar />
            <div className='content-container'>
                <button className='follow-back-button' onClick={() => navigate('/profile')}>
                    Profile
                </button>
                <h1 className='follow-h1'>Following</h1>
                {following.length > 0 ? (
                    <ul className='user-list'>
                        {following.map((user) => (
                            <li key={user.id} className='following-card' onClick={() => navigateToUserProfile(user.id)}>
                                <img 
                                    src={user.profile_pic || defaultProfilePic}
                                    alt={user.username}
                                    className='user-profile-pic'
                                />
                                <span>{user.username}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleUnfollow(user.id); }}>
                                    Unfollow
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Not following anyone yet</p>
                )}
            </div>
            <MessagesBar />
        </div>
    );
};

export default FollowingList;
