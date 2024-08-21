import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseUrl = 'http://127.0.0.1:5555';

const PostCreationForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTagsAndCategories = async () => {
            try {
                const [tagsResponse, categoriesResponse] = await Promise.all([
                    axios.get(`${baseUrl}/tags`),
                    axios.get(`${baseUrl}/categories`)
                ]);
                setTags(tagsResponse.data);
                setCategories(categoriesResponse.data);
            } catch (error) {
                console.error('Error fetching tags and categories:', error);
            }
        };

        fetchTagsAndCategories();
    }, []);

    const handleTagChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        if (selectedOptions.length <= 3) {
            setSelectedTags(selectedOptions);
        } else {
            alert('You can select up to 3 tags only');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const minTitleLength = 5;
        const minContentLength = 20;

        if (title.trim().length < minTitleLength) {
            newErrors.title = `Title must be at least ${minTitleLength} characters long.`;
        }
        if (content.trim().length < minContentLength) {
            newErrors.content = `Content must be at least ${minContentLength} characters long.`;
        }
        if (!selectedCategory) {
            newErrors.category = 'Category is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePostCreation = async () => {
        if (!validateForm()) return;

        try {
            await axios.post(`${baseUrl}/create-post`, 
                { title, content, category_id: selectedCategory, tags: selectedTags }, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            setTitle('');
            setContent('');
            setSelectedTags([]);
            setSelectedCategory('');
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
            {errors.title && <p className='error'>{errors.title}</p>}
            <textarea
                rows='5'
                placeholder='Content'
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && <p className='error'>{errors.content}</p>}
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value=''>Select Category</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            {errors.category && <p className='error'>{errors.category}</p>}
            <p>Select up to 3 tags:</p>
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
