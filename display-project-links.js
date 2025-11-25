// Display project links in the sidebar

/**
 * Displays simple text links for all posts in the project titles sidebar
 * @param {Array} blogPosts - Array of blog post objects from Supabase
 */
function displayProjectLinks(blogPosts)
{
    const projectTitlesContainer = document.querySelector('.project-titles');
    
    if (!projectTitlesContainer) 
    {
        console.error('Project titles container not found');
        return;
    }
    
    // Find existing post links (not the header) and remove them
    const existingLinks = projectTitlesContainer.querySelectorAll('a:not(:first-child)');
    existingLinks.forEach(link => link.remove());
    
    // If no posts, show message
    if (blogPosts.length === 0) 
    {
        const noPostsMessage = document.createElement('p');
        noPostsMessage.textContent = 'No posts yet';
        noPostsMessage.style.color = '#718096';
        noPostsMessage.style.fontStyle = 'italic';
        projectTitlesContainer.appendChild(noPostsMessage);
        return;
    }
    
    // Create links for each post
    for (let index = 0; index < blogPosts.length; index++) 
    {
        const post = blogPosts[index];
        
        // Create the link element
        const linkElement = document.createElement('a');
        linkElement.href = `projects/post.html?postId=${post.id}`;
        
        // Create the paragraph with post title
        const paragraphElement = document.createElement('p');
        paragraphElement.textContent = post.title;
        
        // Put paragraph inside link
        linkElement.appendChild(paragraphElement);
        
        // Add link to container
        projectTitlesContainer.appendChild(linkElement);
    }
}

export { displayProjectLinks };