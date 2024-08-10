// HomeComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostActions from './PostActions'; 
import NavigationBar from './NavigationBar'; 

const baseUrl = 'http://127.0.0.1:5555';

const HomeComponent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (retry = true) => {
        try {
            const response = await axios.get(`${baseUrl}/posts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                try {
                    await refreshAccessToken();
                    return fetchPosts(false);
                } catch (refreshError) {
                    setError('Failed to refresh token');
                }
            } else {
                setError('Failed to fetch posts');
                console.error('Error fetching posts:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const response = await axios.post(`${baseUrl}/refresh`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('refresh_token')}`
                }
            });
            localStorage.setItem('access_token', response.data.access_token);
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!newComment.trim()) return;

        try {
            await axios.post(`${baseUrl}/posts/${postId}/comments`, { content: newComment }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, comments: [...(post.comments || []), { content: newComment, user: 'You', created_at: new Date().toISOString() }], comments_count: (post.comments_count || 0) + 1 }
                    : post
            ));
            setNewComment(''); 
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    await refreshAccessToken();
                    return handleCommentSubmit(postId);
                } catch (refreshError) {
                    console.error('Error refreshing token while commenting on post:', refreshError);
                }
            } else {
                console.error('Error commenting on post:', error);
            }
        }
    };

    const togglePostExpansion = (postId) => {
        setExpandedPostId(expandedPostId === postId ? null : postId);
    };

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='home-container'>
            <NavigationBar /> 
            <main>
                <h1>Home Page</h1>
                {posts.length === 0 ? (
                    <p>No posts found, try following some users.</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className='post-card'>
                            <h2 onClick={() => togglePostExpansion(post.id)}>{post.title}</h2>
                            <p>{post.content}</p>
                            <small>Posted by {post.author} on {new Date(post.created_at).toLocaleString()}</small>
                            <PostActions
                                post={post}
                                fetchPosts={fetchPosts}
                            />
                            {expandedPostId === post.id && (
                                <div className='expanded-content'>
                                    <div className='comment-section'>
                                        <h3>Comments ({post.comments_count || 0})</h3>
                                        {(post.comments || []).map((comment, index) => (
                                            <div key={index} className='comment'>
                                                <p><strong>{comment.user}:</strong> {comment.content}</p>
                                                <small>{new Date(comment.created_at).toLocaleString()}</small>
                                            </div>
                                        ))}
                                        <div className='comment-form'>
                                            <textarea
                                                rows='3'
                                                placeholder='Add a comment...'
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <button onClick={() => handleCommentSubmit(post.id)}>Comment</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default HomeComponent;