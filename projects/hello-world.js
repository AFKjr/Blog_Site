// Getting hello world post ID from the url

import { supabaseClient } from '../supabaseImport.js';

async function getHelloWorldPost() 
{
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (!postId)
    {
        document.getElementById('post-container').textContent = 'No post ID provided in the URL.';
        return;
    }

    console.log('Fetching post with ID:', postId);

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
    
    console.log('Post loaded successfully:', post); 

    // Creating the hello world elements

    const titleElement = document.createElement('h1');
    const bodyElement = document.createElement('p');
    const dateElement = document.createElement('p');

    // Filling the elements with data

    titleElement.textContent = post.title;
    bodyElement.textContent = post.content;
    dateElement.textContent = new Date(post.date_created).toLocaleDateString();
    
    // Adding it to the page

    const postContainer = document.getElementById('post-container');
    postContainer.appendChild(titleElement);
    postContainer.appendChild(bodyElement);
    postContainer.appendChild(dateElement);
}

getHelloWorldPost();
