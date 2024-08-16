import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles.css";

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:5555/login', formData);
      
      
      const { access_token, refresh_token } = response.data;

      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      
      navigate('/home');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed. Please check your credentials and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="login">
      <div className='login-container'>
        <h2>Please provide your credentials</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="login-form-content">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
            <div className='login-button-wrapper'>
              <button className='login-button' type="submit">Login</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
