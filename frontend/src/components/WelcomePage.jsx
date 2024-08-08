import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../index.css";
import axios from 'axios';

export default class WelcomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: 'johndoe',
      password: 'johndoe@1234',
      errorMessage: '',
      redirectToSignup: false,
      redirectToProfile: false
    };
  }

  componentDidMount() {
    // Check for user details in session storage
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    if (userDetails) {
      this.setState({ username: userDetails.username, redirectToProfile: true });
    }

    // Run the DOM manipulation code
    const textElement = document.getElementById('text');
    if (textElement) {
      const text = textElement.textContent;
      textElement.innerHTML = text.split('').map(letter => `<span>${letter}</span>`).join('');
    }
  }

  handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    if (!username || !password) {
      this.setState({ errorMessage: 'Both fields are required.' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });

      if (response.status === 200) {
        sessionStorage.setItem('userDetails', JSON.stringify({ username }));
        this.setState({ errorMessage: '', redirectToProfile: true });
      } else {
        this.setState({ errorMessage: response.data.message || 'An error occurred' });
      }
    } catch (error) {
      this.setState({ errorMessage: 'An error occurred while logging in.' });
    }
  };

  handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('userDetails');
    this.setState({ username: '' });
    this.props.navigate('/signin'); // Use navigate for redirection
  };

  handleSignupRedirect = () => {
    this.setState({ redirectToSignup: true });
  };

  render() {
    if (this.state.redirectToSignup) {
      return <Navigate to="/signup" />;
    }

    if (this.state.redirectToProfile) {
      return <Navigate to="/profile" />;
    }

    return (
      <div>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="#">TechTalk</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
              {/* home features */}
              <span className="button-container">
                <button className="btn_signup" onClick={this.handleSignupRedirect}>Sign Up</button>
              </span>
            </div>
          </div>
        </nav>

        <main role="main">
          <div className="jumbotron">
            <div className="container">
              <h1 id="text" className="display-3"><span>Welcome-to-TechTalk</span></h1>
              <p>TechTalk is a platform where technology enthusiasts can connect, share insights, and discuss the latest trends in tech.</p>
              <p>Join our community to stay updated and collaborate with like-minded individuals.</p>
            </div>
          </div>

          <div className="container">
            <div>
              <form onSubmit={this.handleLogin} className="form-signin">
                <h2 className="form-signin-heading">Please sign in</h2>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  required
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  required
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
                {this.state.errorMessage && <div className="error-message">{this.state.errorMessage}</div>}
                <button className="btn btn-lg btn-primary btn-block" type="submit">Login</button>
              </form>
            </div>
          </div>
        </main>

        <footer className="container">
          <p>&copy; TechTalk 2024</p>
        </footer>
      </div>
    );
  }
}
