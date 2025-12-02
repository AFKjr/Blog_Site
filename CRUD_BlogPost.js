// CRUD operations for blog posts with security improvements

import { supabaseClient } from './supabaseImport.js';
import { getAuthStatus } from './authCheck.js';
import { validateBlogPost } from './inputValidation.js';
import { postRateLimiter } from './rateLimiting.js';
import { displayProjectLinks } from './display-project-links.js';

let blogPosts = [];
let currentEditingPostId = null;

/**
 * Create - Add new blog post (for public interface - deprecated in favor of admin panel)
 */
async function addNewBlogPost() 
{
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    
    if (!getAuthStatus()) 
    {
        alert("You must be logged in to add posts.");
        return;
    }
    
    // Check rate limiting
    const rateLimitCheck = postRateLimiter.recordAttempt();
    if (!rateLimitCheck.allowed) 
    {
        alert(rateLimitCheck.reason);
        return;
    }
    
    // Validate and sanitize input
    const validation = validateBlogPost(title, content);
    
    if (!validation.isValid) 
    {
        alert('Validation errors:\n' + validation.errors.join('\n'));
        return;
    }

    // Insert into Supabase with sanitized data
    const { data, error } = await supabaseClient
        .from('blog_posts')
        .insert([
            { 
                title: validation.sanitizedTitle, 
                content: validation.sanitizedContent 
            }
        ])
        .select();
    
    if (error) 
    {
        console.error('Error adding post:', error);
        alert('Failed to add post. Please try again.');
    } 
    else 
    {
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";
        clearDraft();
        await loadBlogPosts();
    }
}

/**
 * Read - Load all blog posts
 */
async function loadBlogPosts()
{
    const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .order('date_created', { ascending: false });
    
    if (error) 
    {
        console.error('Error loading posts:', error);
    } 
    else 
    {
        blogPosts = data || [];
        displayBlogPosts();
        displayProjectLinks(blogPosts);
    }
}

/**
 * Display blog posts with escaped HTML
 * Only shows most recent post with first 100 words and read more link
 */
function displayBlogPosts()
{
    const blogContainer = document.getElementById("blog-posts");

    if (!blogContainer) return;
    
    blogContainer.innerHTML = "";
    
    if (blogPosts.length === 0) 
    {
        blogContainer.innerHTML = '<p style="color:#718096;text-align:center;padding:2rem;">No posts yet. Check back soon!</p>';
        return;
    }
    
    // Only display the most recent post (first in array since ordered by date_created desc)
    const post = blogPosts[0];
    
    const postDiv = document.createElement("div");
    postDiv.className = "blog-post";
    
    const title = document.createElement("h2");
    const titleLink = document.createElement("a");
    titleLink.href = `projects/posts.html?postId=${post.id}`;
    titleLink.textContent = post.title; // textContent auto-escapes
    titleLink.style.textDecoration = "none";
    titleLink.style.color = "inherit";
    title.appendChild(titleLink);
    
    const date = document.createElement("p");
    date.className = "post-meta";
    const dateEm = document.createElement("em");
    const postDate = new Date(post.date_created).toLocaleDateString();
    dateEm.textContent = `Posted on: ${postDate}`;
    if (post.date_edited) 
    {
        const editDate = new Date(post.date_edited).toLocaleDateString();
        dateEm.textContent += ` (Edited: ${editDate})`;
    }
    date.appendChild(dateEm);
    
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "post-content";
    
    // Create a temporary div to parse HTML and extract text for word count
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Get first 100 words from text content
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const first100Words = words.slice(0, 100).join(' ');
    const needsReadMore = words.length > 100;
    
    const content = document.createElement("div");
    
    // For display, show HTML formatted content (truncated)
    if (needsReadMore) {
        // Create a temporary div to get the HTML for first 100 words
        const previewDiv = document.createElement('div');
        previewDiv.innerHTML = post.content;
        
        // Get text nodes and truncate
        let wordCount = 0;
        const truncateNode = (node) => {
            if (wordCount >= 100) {
                return false;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeWords = node.textContent.split(/\s+/).filter(w => w.length > 0);
                if (wordCount + nodeWords.length > 100) {
                    const remainingWords = 100 - wordCount;
                    node.textContent = nodeWords.slice(0, remainingWords).join(' ') + '...';
                    wordCount = 100;
                    return false;
                }
                wordCount += nodeWords.length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    if (!truncateNode(node.childNodes[i])) {
                        // Remove remaining siblings
                        while (node.childNodes[i + 1]) {
                            node.removeChild(node.childNodes[i + 1]);
                        }
                        break;
                    }
                }
            }
            return true;
        };
        
        truncateNode(previewDiv);
        content.innerHTML = previewDiv.innerHTML;
    } else {
        content.innerHTML = post.content;
    }
    
    contentWrapper.appendChild(content);
    
    // Add "Read More" link if content is truncated
    if (needsReadMore) 
    {
        const readMoreLink = document.createElement("a");
        readMoreLink.href = `projects/posts.html?postId=${post.id}`;
        readMoreLink.textContent = "Click here to read on";
        readMoreLink.className = "read-more-link";
        contentWrapper.appendChild(readMoreLink);
    }
    
    postDiv.appendChild(title);
    postDiv.appendChild(date);
    postDiv.appendChild(contentWrapper);
    
    if (getAuthStatus()) 
    {
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function() { editBlogPost(post.id); };
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function() { deleteBlogPost(post.id); };
        
        postDiv.appendChild(editBtn);
        postDiv.appendChild(deleteBtn);
    }
    
    blogContainer.appendChild(postDiv);
}

/**
 * Update - Edit existing blog post
 */
async function editBlogPost(id)
{
    if (!getAuthStatus()) 
    {
        alert("You must be logged in to edit posts.");
        return;
    }
    
    const editedPost = blogPosts.find(post => post.id === id);
    if (editedPost)
    {
        const modal = document.getElementById("Modal");
        const closeButton = document.querySelector(".close-button");
        const saveChangesBtn = document.getElementById("save-changes-btn");
        const cancelChangesBtn = document.getElementById("Cancel-changes-btn");
        const editTitleInput = document.getElementById("edit-post-title");
        const editContentContainer = document.getElementById("edit-post-content"); 

        editTitleInput.value = editedPost.title;
        
        // Wait for Quill to initialize and set content
        modal.style.display = "block";
        
        // Wait for Quill to be initialized by the observer
        setTimeout(() => {
            if (window.quillEditor) {
                window.quillEditor.root.innerHTML = editedPost.content;
            }
        }, 100);
        currentEditingPostId = id;

        closeButton.onclick = function() {
            modal.style.display = "none";  
        }
        cancelChangesBtn.onclick = function() {
            modal.style.display = "none";
        }
        saveChangesBtn.onclick = async function() {
            await saveEditedPost();
            modal.style.display = "none";
        }
    }
}

/**
 * Save edited post with validation
 */
async function saveEditedPost()
{
    const editTitleInput = document.getElementById("edit-post-title");
    
    // Get content from Quill editor
    const content = window.quillEditor ? window.quillEditor.root.innerHTML : '';
    
    // Validate and sanitize
    const validation = validateBlogPost(editTitleInput.value, content);
    
    if (!validation.isValid) 
    {
        alert('Validation errors:\n' + validation.errors.join('\n'));
        return;
    }
    
    const { data, error } = await supabaseClient
        .from('blog_posts')
        .update({ 
            title: validation.sanitizedTitle,
            content: validation.sanitizedContent,
            date_edited: new Date().toISOString()
        })
        .eq('id', currentEditingPostId)
        .select();
    
    if (error) 
    {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
    } 
    else 
    {
        await loadBlogPosts();
    }
}

/**
 * Delete - Remove blog post
 */
async function deleteBlogPost(id)
{
    if (!getAuthStatus()) 
    {
        alert("You must be logged in to delete posts.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this post?"))
    {
        const { error } = await supabaseClient
            .from('blog_posts')
            .delete()
            .eq('id', id);
        
        if (error) 
        {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } 
        else 
        {
            await loadBlogPosts();
        }
    }
}

/**
 * Draft management functions
 */
function setupAutoSaveDraft() 
{
    const postTitle = document.getElementById("post-title");
    const postContent = document.getElementById("post-content");
    
    if (!postTitle || !postContent) return;
    
    const savedTitle = localStorage.getItem("draftTitle");
    const savedContent = localStorage.getItem("draftContent");
    
    if (savedTitle) 
    {
        postTitle.value = savedTitle;
    }
    if (savedContent) 
    {
        postContent.value = savedContent;
    }
    
    postTitle.addEventListener("keyup", function() {
        localStorage.setItem("draftTitle", postTitle.value);
    });
    
    postContent.addEventListener("keyup", function() {
        localStorage.setItem("draftContent", postContent.value);
    });
}

function clearDraft() 
{
    localStorage.removeItem("draftTitle");
    localStorage.removeItem("draftContent");
}

export { 
    addNewBlogPost, 
    loadBlogPosts, 
    displayBlogPosts, 
    editBlogPost, 
    deleteBlogPost,
    setupAutoSaveDraft,
    clearDraft
};
