import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner'; 
import NavigationBar from './NavigationBar';
import PostActions from './PostActions'; 

const baseUrl = 'http://127.0.0.1:5555';

const Explore = () => {
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('trendingPosts'); 

    useEffect(() => {
        const fetchExploreData = async () => {
            try {
                const postsResponse = await axios.get(`${baseUrl}/trending-posts`);
                const usersResponse = await axios.get(`${baseUrl}/recommended-users`);

                setTrendingPosts(postsResponse.data);
                setRecommendedUsers(usersResponse.data);
            } catch (error) {
                setError('Failed to fetch explore data.');
            } finally {
                setLoading(false);
            }
        };

        fetchExploreData();
    }, []);

    const handleSectionClick = (section) => {
        setActiveSection(section);
    };

    const handlePostUpdate = (postId, newComment) => {
        setTrendingPosts(trendingPosts.map(post =>
            post.id === postId
                ? {
                    ...post, 
                    comments: [...(post.comments || []), { content: newComment, user: 'You', created_at: new Date().toISOString() }], 
                    comments_count: (post.comments_count || 0) + 1 
                }
                : post
        ));
    };

    if (loading) return <Spinner />; 
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="explore-container">
            <NavigationBar />
            <div className="content-container">
                <div className="horizontal-bar">
                    <button 
                        className={activeSection === 'trendingPosts' ? 'active' : ''} 
                        onClick={() => handleSectionClick('trendingPosts')}
                    >
                        Trending Posts
                    </button>
                    <button 
                        className={activeSection === 'discoverPeople' ? 'active' : ''} 
                        onClick={() => handleSectionClick('discoverPeople')}
                    >
                        Discover People
                    </button>
                </div>

                {activeSection === 'trendingPosts' && (
                    <section className="post-section">
                        <h2>Trending Posts</h2>
                        {trendingPosts.length > 0 ? (
                            trendingPosts.map((post) => (
                                <div key={post.id} className="post-card">
                                    <h3 
                                        onClick={() => setTrendingPosts(trendingPosts.map(p => p.id === post.id ? { ...p, isExpanded: !p.isExpanded } : p))}
                                    >
                                        {post.title}
                                    </h3>
                                    <p>{post.content}</p>
                                    <div className='small-block'>
                                        <small>Posted by {post.author} on {new Date(post.created_at).toLocaleString()}</small>
                                    </div>
                                    <PostActions
                                        post={post}
                                        fetchPosts={() => fetchExploreData()} 
                                        onPostUpdate={handlePostUpdate}
                                    />
                                    {post.isExpanded && (
                                        <div className='expanded-content'>
                                            <div className='comment-section'>
                                                <h3>Comments ({post.comments_count || 0})</h3>
                                                {(post.comments || []).map((comment, index) => (
                                                    <div key={index} className='comment'>
                                                        <p><strong>{comment.user}:</strong> {comment.content}</p>
                                                        <small>{new Date(comment.created_at).toLocaleString()}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No trending posts available.</p>
                        )}
                    </section>
                )}

                {activeSection === 'discoverPeople' && (
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
                )}
            </div>
        </div>
    );
};

export default Explore;
