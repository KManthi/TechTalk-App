import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();

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
      const response = await axios.post('http://127.0.0.1:5555/users', formData);
      setSuccess('Account created successfully!');
      setError('');
      history.push('/home');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="signup">
      <h2>Create Account</h2>
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
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default Signup;