import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';

const baseUrl = 'http://127.0.0.1:5555';

const UserSettings = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [bio, setBio] = useState('');
    const [socialLinks, setSocialLinks] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleProfilePicChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmitProfilePic = async () => {
        try {
            const formData = new FormData();
            formData.append('profile_pic', profilePic);

            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios.post(`${baseUrl}/user/profile-pic`, formData, {
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

    const handleApiCall = async (url, method, data) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No auth token found');

            await axios({
                url: `${baseUrl}${url}`,
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: data
            });

            return true;
        } catch (error) {
            setError(`Failed to ${method === 'put' ? 'update' : method} data`);
            console.error(`Error ${method === 'put' ? 'updating' : method} data:`, error);
            return false;
        }
    };

    const handleUpdateUsername = async () => {
        const success = await handleApiCall(`/userprofiles/1`, 'put', { username });
        if (success) alert('Username updated successfully');
    };

    const handleChangePassword = async () => {
        const success = await handleApiCall(`/user/password`, 'put', { password, newPassword });
        if (success) alert('Password changed successfully');
    };

    const handleUpdateProfile = async () => {
        const success = await handleApiCall(`/userprofiles/1`, 'put', { bio, social_links: socialLinks });
        if (success) alert('Profile updated successfully');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const success = await handleApiCall(`/userprofiles/1`, 'delete');
            if (success) {
                alert('Account deleted successfully');
                localStorage.removeItem('access_token');
                navigate('/');
            }
        }
    };

    const handleLogout = async () => {
        const success = await handleApiCall(`/logout`, 'delete');
        if (success) {
            localStorage.removeItem('access_token');
            navigate('/');
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
                    <button className="update-button" onClick={handleSubmitProfilePic}>Update </button>
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
                    <button className="update-button" onClick={handleUpdateUsername}>Update </button>
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
                    <button className="update-button" onClick={handleChangePassword}>Change </button>
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
