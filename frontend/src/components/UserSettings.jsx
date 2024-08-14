import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            if (!token) {
                throw new Error('No auth token found');
            }

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

    
    const handleUpdateUsername = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            await axios.put(`${baseUrl}/userprofiles/1`, { username }, {
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
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            await axios.put(`${baseUrl}/user/password`, { password, newPassword }, {
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
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            await axios.put(`${baseUrl}/userprofiles/1`, { bio, social_links: socialLinks }, {
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
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            await axios.delete(`${baseUrl}/userprofiles/1`, {
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
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No auth token found');
            }

            await axios.delete(`${baseUrl}/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            localStorage.removeItem('access_token');
            navigate('/'); 
        } catch (error) {
            setError('Failed to log out');
            console.error('Error logging out:', error);
        }
    };

    const handleBackClick = () => {
        navigate('/profile');
    };

    return (
        <div>
            <button onClick={handleBackClick}>Back to Profile</button>
            <h1>User Settings</h1>

            {error && <div className="error">{error}</div>}

            <div>
                <h2>Change Profile Picture</h2>
                <input type="file" onChange={handleProfilePicChange} />
                <button onClick={handleSubmitProfilePic}>Update Profile Picture</button>
            </div>

            <div>
                <h2>Change Username</h2>
                <input
                    type="text"
                    placeholder="New username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={handleUpdateUsername}>Update Username</button>
            </div>

            <div>
                <h2>Change Password</h2>
                <input
                    type="password"
                    placeholder="Current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={handleChangePassword}>Change Password</button>
            </div>

            <div>
                <h2>Update Profile</h2>
                <input
                    type="text"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Social links"
                    value={socialLinks}
                    onChange={(e) => setSocialLinks(e.target.value)}
                />
                <button onClick={handleUpdateProfile}>Update Profile</button>
            </div>

            <div>
                <h2>Delete Account</h2>
                <button onClick={handleDeleteAccount}>Delete My Account</button>
            </div>

            <div>
                <h2>Logout</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default UserSettings;
