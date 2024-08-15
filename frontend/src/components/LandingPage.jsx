import React, { Component } from "react";
import { Navigate, Link } from "react-router-dom";
import "../styles.css";

export default class WelcomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirectToHome: false,
    };
  }

  componentDidMount() {
    const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    if (userDetails) {
      this.setState({ redirectToHome: true });
    }
  }

  render() {
    if (this.state.redirectToHome) {
      return <Navigate to="/home" />;
    }

    return (
      <div className="landing-page">
        <nav className="top-landing">
          <div className="landing-container">
            <Link className="navbar-link" to="/about">
              About
            </Link>
              <Link className="navbar-link" to="/login">
                Login
              </Link>
              <Link className="navbar-link" to="/signup">
                Sign Up
              </Link>
          </div>
        </nav>

        <main role="main" className="main-container">
          <div className="welcome-container">
            <h1 id="text" className="display-3">
              Welcome to TechTalk
            </h1>
            <p>
              A platform where technology enthusiasts can connect,
              share insights, and discuss the latest trends in tech.
            </p>
            <p>
              Join our community to stay updated and collaborate with
              like-minded individuals.
            </p>
          </div>
        </main>
      </div>
    );
  }
}
