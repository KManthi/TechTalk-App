import React from 'react';
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:5555';

const PostActions = ({ post, fetchPosts }) => {
    const handleLike = async (postId, liked) => {
        try {
            if (liked) {
                await axios.delete(`${baseUrl}/posts/${postId}/ratings/${post.rating_id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            } else {
                await axios.post(`${baseUrl}/ratings`, {
                    post_id: postId,
                    status: 'like'
                }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            }
            fetchPosts();
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const handleDislike = async (postId, disliked) => {
        try {
            if (disliked) {
                await axios.delete(`${baseUrl}/posts/${postId}/ratings/${post.rating_id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            } else {
                await axios.post(`${baseUrl}/ratings`, {
                    post_id: postId,
                    status: 'dislike'
                }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            }
            fetchPosts();
        } catch (error) {
            console.error('Error handling dislike:', error);
        }
    };

    const handleFavorite = async (postId, favorited) => {
        try {
            if (favorited) {
                await axios.delete(`${baseUrl}/posts/${postId}/favorite`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            } else {
                await axios.post(`${baseUrl}/posts/${postId}/favorite`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
            }
            fetchPosts();
        } catch (error) {
            console.error('Error handling favorite:', error);
        }
    };

    return (
        <div className='post-actions'>
            <button onClick={() => handleLike(post.id, post.liked)} className={post.liked ? 'liked' : ''}>👍 {post.likes_count}</button>
            <button onClick={() => handleDislike(post.id, post.disliked)} className={post.disliked ? 'disliked' : ''}>👎 {post.dislikes_count}</button>
            <button onClick={() => handleFavorite(post.id, post.favorited)} className={post.favorited ? 'favorited' : ''}>⭐ {post.favorites_count}</button>
            <button className='comment-bubble'>
                💬 {post.comments_count || 0}
            </button>
        </div>
    );
};

export default PostActions;
