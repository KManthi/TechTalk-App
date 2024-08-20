import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import jwtDecode from 'jwt-decode';

const baseUrl = 'http://127.0.0.1:5555';

const getUserID = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken.identity; 
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

const UserSettings = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [bio, setBio] = useState('');
    const [socialLinks, setSocialLinks] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userId = getUserID();

    const handleProfilePicChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmitProfilePic = async () => {
        if (!userId) return;

        try {
            const formData = new FormData();
            formData.append('profile_pic', profilePic);

            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.post(`${baseUrl}/my-profile`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Profile picture updated successfully');
        } catch (error) {
            setError('Failed to update profile picture');
            console.error('Error updating profile picture:', error);
        }
    };

    const handleUpdateUsername = async () => {

        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.put(`${baseUrl}/my-profile`, { username }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Username updated successfully');
        } catch (error) {
            setError('Failed to update username');
            console.error('Error updating username:', error);
        }
    };

    const handleChangePassword = async () => {
        if (!userId) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.put(`${baseUrl}/my-profile`, { password, newPassword }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Password changed successfully');
        } catch (error) {
            setError('Failed to change password');
            console.error('Error changing password:', error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!userId) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.put(`${baseUrl}/my-profile`, { bio, social_links: socialLinks }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Profile updated successfully');
        } catch (error) {
            setError('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!userId) return;

        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No auth token found');

                await axios.delete(`${baseUrl}/userprofiles/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                alert('Account deleted successfully');
                localStorage.removeItem('access_token');
                navigate('/');
            } catch (error) {
                setError('Failed to delete account');
                console.error('Error deleting account:', error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.delete(`${baseUrl}/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            localStorage.removeItem('access_token');
            navigate('/');
        } catch (error) {
            setError('Failed to logout');
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="user-settings">
            <NavigationBar />
            <div className="user-settings-container">
                <h1>User Settings</h1>

                {error && <div className="error">{error}</div>}

                <div className="user-settings-section">
                    <h2 className='regular'>Change Profile Picture</h2>
                    <input 
                        type="file" 
                        className="file-input"
                        onChange={handleProfilePicChange} 
                    />
                    <button className="update-button" onClick={handleSubmitProfilePic}>Update</button>
                </div>

                <div className="user-settings-section">
                    <h2 className='regular'>Change Username</h2>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="New username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="update-button" onClick={handleUpdateUsername}>Update</button>
                </div>

                <div className="user-settings-section">
                    <h2 className='regular'>Change Password</h2>
                    <input
                        type="password"
                        className="password-input"
                        placeholder="Current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        className="password-input"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button className="update-button" onClick={handleChangePassword}>Change</button>
                </div>

                <div className="user-settings-section">
                    <h2 className='regular'>Update Profile</h2>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Social links"
                        value={socialLinks}
                        onChange={(e) => setSocialLinks(e.target.value)}
                    />
                    <button className="update-button" onClick={handleUpdateProfile}>Update</button>
                </div>

                <div className="user-settings-section">
                    <h2 className='red-head'>Delete Account</h2>
                    <button className="delete-button" onClick={handleDeleteAccount}>Delete</button>
                </div>

                <div className="user-settings-section">
                    <h2 className='red-head'>Logout</h2>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
