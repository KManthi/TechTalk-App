import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "../index.css";

export default class WelcomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirectToSignup: false,
      redirectToHome: false,
      redirectToLogin: false,
    };
  }

  componentDidMount() {
    const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    if (userDetails) {
      this.setState({ redirectToHome: true });
    }
  }

  render() {
    if (this.state.redirectToSignup) {
      return <Navigate to="/signup" />;
    }

    if (this.state.redirectToHome) {
      return <Navigate to="/home" />;
    }

    if (this.state.redirectToLogin) {
      return <Navigate to="/login" />;
    }

    return (
      <div>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="#">
              <em>TechTalk</em>
            </a>
          </div>
        </nav>

        <main role="main" className="main-container">
          <div className="welcome-container">
            <h1 id="text" className="display-3">
              Welcome to TechTalk
            </h1>
            <p>
              TechTalk is a platform where technology enthusiasts can connect,
              share insights, and discuss the latest trends in tech.
            </p>
            <p>
              Join our community to stay updated and collaborate with
              like-minded individuals.
            </p>
          </div>

          <div className="authentication-container">
            <h2 className="auth-heading">Login or Signup to continue</h2>
            <div className="landing-buttons">
            <button
              className="btn btn-lg btn-primary btn-block"
              type="button"
              onClick={() => this.setState({ redirectToLogin: true })}
            >
              Login
            </button>
            <button
              className="btn btn-lg btn-primary btn-block"
              type="button"
              onClick={() => this.setState({ redirectToSignup: true })}
            >
              Sign Up
            </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
