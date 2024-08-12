import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostActions from './PostActions'; 
import NavigationBar from './NavigationBar'; 
import Spinner from './Spinner'; 

const baseUrl = 'http://127.0.0.1:5555';

const HomeComponent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${baseUrl}/posts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(response.data);
        } catch (error) {
            setError('Failed to fetch posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdate = (postId, newComment) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post, 
                    comments: [...(post.comments || []), { content: newComment, user: 'You', created_at: new Date().toISOString() }], 
                    comments_count: (post.comments_count || 0) + 1 
                }
                : post
        ));
    };

    if (loading) return <Spinner />; // Show spinner while loading
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
                            <h2 onClick={() => setPosts(posts.map(p => p.id === post.id ? { ...p, isExpanded: !p.isExpanded } : p))}>
                                {post.title}
                            </h2>
                            <p>{post.content}</p>
                            <small>Posted by {post.author} on {new Date(post.created_at).toLocaleString()}</small>
                            <PostActions
                                post={post}
                                fetchPosts={fetchPosts}
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
                )}
            </main>
        </div>
    );
};

export default HomeComponent;
