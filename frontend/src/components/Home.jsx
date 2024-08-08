import React, { useEffect, useState } from 'react';
import '../index.css';
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:5555';

const HomeComponent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        fetchPosts();
    }, []);

    const handleLike = async (postId, liked) => {
        try {
            const status = liked ? 'neutral' : 'like';
            await axios.post(`${baseUrl}/ratings`, {
                post_id: postId,
                status
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(posts.map(post => 
                post.id === postId
                    ? { ...post, likes_count: post.likes_count + (liked ? -1 : 1), liked: !liked }
                    : post
            ));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDislike = async (postId, disliked) => {
        try {
            const status = disliked ? 'neutral' : 'dislike';
            await axios.post(`${baseUrl}/ratings`, {
                post_id: postId,
                status
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setPosts(posts.map(post => 
                post.id === postId
                    ? { ...post, dislikes_count: post.dislikes_count + (disliked ? -1 : 1), disliked: !disliked }
                    : post
            ));
        } catch (error) {
            console.error('Error disliking post:', error);
        }
    }; 

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='home-container'>
            <h1>Home Page</h1>
            {posts.length === 0 ? (
                <p>No posts found, try following some users.</p>
            ) : (
                posts.map(post => (
                    <div key={post.id} className='post-card'>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <small>Posted by {post.author} on { new Date(post.created_at).toLocaleString()}</small>
                        <div className='actions'>
                            <button
                                onClick={() => handleLike(post.id, post.liked)}
                                className={post.liked ? 'liked' : ''}
                            >
                                👍 {post.likes_count}
                            </button>
                            <button
                                onClick={() => handleDislike(post.id, post.disliked)}
                                className={post.disliked ? 'disliked' : ''}
                            >
                                👎 {post.dislikes_count}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HomeComponent;