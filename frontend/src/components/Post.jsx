import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseUrl = 'http://127.0.0.1:5555';

const PostCreationForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get(`${baseUrl}/tags`);
                setTags(response.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, []);

    const handleTagChange = (event) => {
        const value = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedTags(value);
    };

    const handlePostCreation = async () => {
        if (!title.trim() || !content.trim()) return;

        try {
            await axios.post(`${baseUrl}/posts`, 
                { title, content, tags: selectedTags }, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            setTitle('');
            setContent('');
            setSelectedTags([]);
            navigate('/home'); 
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className='post-creation-form'>
            <input
                type='text'
                placeholder='Title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                rows='5'
                placeholder='Content'
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <select
                multiple
                value={selectedTags}
                onChange={handleTagChange}
            >
                {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                        {tag.name}
                    </option>
                ))}
            </select>
            <button onClick={handlePostCreation}>Post</button>
        </div>
    );
};

export default PostCreationForm;
