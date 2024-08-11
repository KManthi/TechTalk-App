import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const postsResponse = await axios.get('https://techtalk-app.onrender.com/api/trending-posts');
        const tagsResponse = await axios.get('https://techtalk-app.onrender.com/api/popular-tags');
        const usersResponse = await axios.get('https://techtalk-app.onrender.com/api/recommended-users');

        setTrendingPosts(postsResponse.data);
        setPopularTags(tagsResponse.data);
        setRecommendedUsers(usersResponse.data);
      } catch (error) {
        setError('Failed to fetch explore data.');
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await axios.post(`https://techtalk-app.onrender.com/api/follow/${userId}`);
      alert(`Followed user with ID: ${userId}`);
    } catch (error) {
      alert('Failed to follow user.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="explore-container">
      <SideNav />
      <div className="explore-content">
        <section className="trending-posts">
          <h2>Trending Posts</h2>
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post) => (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            ))
          ) : (
            <p>No trending posts available.</p>
          )}
        </section>

        <section className="popular-tags">
          <h2>Popular Tags</h2>
          {popularTags.length > 0 ? (
            popularTags.map((tag, index) => (
              <span key={index} className="tag">{`#${tag}`}</span>
            ))
          ) : (
            <p>No popular tags available.</p>
          )}
        </section>

        <section className="discover-people">
          <h2>Discover People</h2>
          {recommendedUsers.length > 0 ? (
            recommendedUsers.map((user) => (
              <div key={user.id} className="user-card">
                <span>{user.username}</span>
                <button onClick={() => handleFollow(user.id)}>Follow</button>
              </div>
            ))
          ) : (
            <p>No recommended users available.</p>
          )}
        </section>
      </div>
    </div>
  );
};

const SideNav = () => {
  return (
    <nav className="side-nav">
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/explore" className="active">Explore</a></li>
        <li><a href="/profile">Profile</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/messages">Messages</a></li>
        <li><button onClick={() => window.location.href = '/submit-post'}>Submit a Post</button></li>
      </ul>
    </nav>
  );
};

export default Explore;