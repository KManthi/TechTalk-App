import React, { useState, useEffect } from 'react';

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setTrendingPosts([
        { id: 1, title: 'React Tips', content: 'Some content about React...' },
        { id: 2, title: 'Flask Tips', content: 'Some content about Flask...' }
      ]);
      setPopularTags(['React', 'JavaScript', 'WebDev']);
      setRecommendedUsers([
        { id: 1, username: 'dev_user' },
        { id: 2, username: 'tech_guru' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFollow = (userId) => {
    // Simulate follow action
    alert(`Followed user with ID: ${userId}`);
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
