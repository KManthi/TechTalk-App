import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faThumbsUp, faThumbsDown, faStar, faComment } from '@fortawesome/free-solid-svg-icons';

const baseUrl = 'https://techtalk-app.onrender.com';

const PostCard = ({ post, fetchPosts, onPostUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);

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

    const fetchComments = async (postId) => {
        try {
            const response = await axios.get(`${baseUrl}/posts/${postId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
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
            onPostUpdate(postId, newComment);
            setNewComment('');
            fetchComments(postId); 
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };

    const togglePostExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleCommentForm = () => {
        setIsFormVisible(!isFormVisible);
    };

    return (
        <div className='post-actions'>
            <div className='tags-icon-container'>
                    <FontAwesomeIcon icon={faTags} className='tags-icon' />
                    <div className='tags-hover'>
                        {post.tags && post.tags.map((tag, index) => (
                            <span key={index} className='tag'>{tag}</span>
                        ))}
                    </div>
                </div>
            <button
                onClick={() => handleLike(post.id, post.liked)} 
                className={`like-button ${post.liked ? 'liked' : ''}`}
            >
                <FontAwesomeIcon icon={faThumbsUp} className="glow-effect" /> {post.likes_count}
            </button>
            <button 
                onClick={() => handleDislike(post.id, post.disliked)} 
                className={`dislike-button ${post.disliked ? 'disliked' : ''}`}
            >
                <FontAwesomeIcon icon={faThumbsDown} className="glow-effect"/> {post.dislikes_count}
            </button>
            <button 
                onClick={() => handleFavorite(post.id, post.favorited)} 
                className={`favorite-button ${post.favorited ? 'favorited' : ''}`}
            >
                <FontAwesomeIcon icon={faStar} className="glow-effect" /> {post.favorites_count}
            </button>
            <button 
                onClick={() => toggleCommentForm()} 
                className='comment-bubble'
            >
                <FontAwesomeIcon icon={faComment} /> {post.comments_count || 0}
            </button>
            {isFormVisible && (
                <div className='comment-form'>
                    <textarea
                        rows='3'
                        placeholder='Add a comment...'
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button onClick={() => handleCommentSubmit(post.id)}>Comment</button>
                </div>
            )}
            {isExpanded && comments.length > 0 && (
                <div className='comments-list'>
                    {Array.isArray(comments) && comments.map((comment) => (
                        <div key={comment.id} className='comment'>
                            <p>{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostCard;
