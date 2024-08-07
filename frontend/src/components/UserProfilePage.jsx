// src/components/UserProfilePage.jsx
import React, { useEffect, useState } from 'react';
import './UserProfilePage.css'; 

const UserProfilePage = () => {
  const [user, setUser] = useState(null);

  
  const fetchUserData = async () => {
    
    const userData = {
      profilePicture: 'https://example.com/profile.jpg',
      username: 'johndoe',
      email: 'johndoe@example.com',
      followers: 120,
      following: 80,
      posts: [
        { id: 1, title: 'First Post', content: 'This is the first post' },
        { id: 2, title: 'Second Post', content: 'This is the second post' },
      ],
      followerList: [
        { id: 1, username: 'follower1' },
        { id: 2, username: 'follower2' },
      ],
      favoritePosts: [
        { id: 3, title: 'Favorite Post', content: 'This is a favorite post' },
        { id: 4, title: 'Another Favorite Post', content: 'This is another favorite post' },
      ],
    };
    setUser(userData);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img className="profile-picture" src={user.profilePicture} alt={`${user.username}'s profile`} />
        <h1 className="profile-username">{user.username}</h1>
        <p className="profile-email">Email: {user.email}</p>
        <p className="profile-followers">Followers: {user.followers}</p>
        <p className="profile-following">Following: {user.following}</p>
      </div>
      <hr className="section-divider" />
      <div className="profile-posts">
        <h2>Posts</h2>
        <ul>
          {user.posts.map((post) => (
            <li key={post.id} className="post-item">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="profile-favorites">
        <h2>Favorite Posts</h2>
        <ul>
          {user.favoritePosts.map((post) => (
            <li key={post.id} className="favorite-post-item">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="profile-followers-list">
        <h2>Followers</h2>
        <ul>
          {user.followerList.map((follower) => (
            <li key={follower.id} className="follower-item">
              {follower.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfilePage;
