import React, { useState } from 'react';


const WelcomePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = () => {
        if (!username || !password) {
            setErrorMessage('Both fields are required.');
        } else {
            
            if (username === 'admin' && password === 'admin') {
                setErrorMessage('');
                
                window.location.href = '/dashboard';
            } else {
                setErrorMessage('Invalid username or password.');
            }
        }
    };

    return (
        <div className="welcome-container">
            <div className="welcome-message">
                <h1>Welcome to TechTalk</h1>
                <p>A place  where technology enthusiasts can share knowledge, discuss tech topics, and stay updated with the latest trends.</p>
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
