import React, { useState } from 'react';

const WelcomePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMessage('Both fields are required.');
        } else {
            try {
                const response = await fetch('https://techtalk-app.onrender.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
    
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('access_token', data.access_token);
                    setErrorMessage('');
                    window.location.href = '/profile';
                } else {
                    setErrorMessage(data.message || 'An error occurred');
                }
            } catch (error) {
                setErrorMessage('An error occurred while logging in.');
            }
        }
    };
    

    return (
        <div className="welcome-container">
            <div className="welcome-message">
                <h1>Welcome to TechTalk</h1>
                <p>A place where technology enthusiasts can share knowledge, discuss tech topics, and stay updated with the latest trends.</p>
            </div>
            <div className="form-container">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button onClick={handleLogin}>Login</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button onClick={() => window.location.href = '/signup'}>Sign Up</button>
            </div>
        </div>
    );
};

export default WelcomePage;
