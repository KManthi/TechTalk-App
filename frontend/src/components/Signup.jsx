import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles.css"; 

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { email, username, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    if (username.length < 4) {
      return 'Username must be at least 4 characters long';
    }
    if (!passwordRegex.test(password)) {
      return 'Password must be at least 8 characters long, include one uppercase letter, and one special character';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    try {
      await axios.post('https://techtalk-app.onrender.com/users', formData);
      setSuccess('Account created successfully!');
      setError('');
      navigate('/login');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="signup">
      <div className="signup-container">
        <h2>Join Us!</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className='signup-button-wrapper'>
          <button className="register" type="submit">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
