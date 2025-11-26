// Getting hello world post ID from the url

import { supabaseClient } from '../supabaseImport.js';

async function getPosts() 
{
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (!postId)
    {
        document.getElementById('post-container').textContent = 'No post ID provided in the URL.';
        return;
    }

    // Fetching the hello world post data
    const { data: post, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();
    
    if (error) 
    {
        console.error('Error fetching post:', error);
        document.getElementById('post-container').textContent = `Error loading post: ${error.message}`;
        return;
    }
    
    if (!post) 
    {
        document.getElementById('post-container').textContent = 'Post not found.';
        return;
    }

    // Creating elements with classes for styling
    const postHeader = document.createElement('header');
    postHeader.className = 'post-header';
    
    const titleElement = document.createElement('h1');
    titleElement.className = 'post-title';
    titleElement.textContent = post.title;
    
    const postMeta = document.createElement('div');
    postMeta.className = 'post-meta';
    
    const dateElement = document.createElement('time');
    dateElement.className = 'post-date';
    dateElement.textContent = new Date(post.date_created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // If post was edited, show that too
    if (post.date_edited) 
    {
        const editedElement = document.createElement('span');
        editedElement.className = 'post-edited';
        editedElement.textContent = ` (Edited: ${new Date(post.date_edited).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })})`;
        postMeta.appendChild(dateElement);
        postMeta.appendChild(editedElement);
    } 
    else 
    {
        postMeta.appendChild(dateElement);
    }
    
    const bodyElement = document.createElement('div');
    bodyElement.className = 'post-body';
    bodyElement.textContent = post.content;
    bodyElement.style.whiteSpace = 'pre-wrap'; // Preserves line breaks
    
    // Build the structure
    postHeader.appendChild(titleElement);
    postHeader.appendChild(postMeta);
    
    const postContainer = document.getElementById('post-container');
    postContainer.appendChild(postHeader);
    postContainer.appendChild(bodyElement);
}

getPosts();