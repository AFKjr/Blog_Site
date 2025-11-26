// Admin panel functionality w/ security checks

import { supabaseClient } from '../supabaseImport.js';
import { validateBlogPost, setupCharacterCounters } from './inputValidation.js ';
import { loginRateLimiter, postRateLimiter } from '../rateLimiting.js';

let currentEditingPostId = null;

function showError(elementId, message)
{
    const errorElement = document.getElementById(elementId);
    if (errorElement)
    {
        errorElement.textContent = message;
    }
}

function clearError(elementId)
{
    const errorElement = document.getElementById(elementId);
    if (errorElement)
    {
        errorElement.textContent = '';
    }
}

async function handleLogin(event)
{
    event.preventDefault();

    // check rate limiting

    const rateLimitCheck = loginRateLimiter.recordAttempt();
    if (!rateLimitCheck.allowed)
    {
        showError('login-error', rateLimitCheck.reason);
        document.getElementById('login-btn').disabled = true;

        setTimeout(() =>
        {
            document.getElementById('login-btn').disabled = false;
        }, 5000); // 5 minutes

        return;
    }

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    clearError('login-error');

    if (!email || !password)
    {
        showError('login-error', 'Email and password are required.');
        return;
    }

    const LoginButton = document.getElementById('login-btn');
    LoginButton.disabled = true;
    LoginButton.textContent = 'Logging in...';

    try
    {
        const { data, error } = supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) 
        {
            throw error;
        }

        // Suscessful login - reset rate limiter

        loginRateLimiter.reset();

        // clear form

        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';

        // Show admin panel

        document.getElementById('login-card').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';

        //Load posts

        await loadBlogPosts();

    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Invalid email or password');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}


/**
 * Handles logout
 */
async function handleLogout() {
    await supabaseClient.auth.signOut();
    document.getElementById('login-card').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    window.location.href = 'index.html';
}

/**
 * Loads all posts for admin management
 */
async function loadAdminPosts() {
    const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .order('date_created', { ascending: false });
    
    if (error) {
        console.error('Error loading posts:', error);
        return;
    }
    
    displayAdminPosts(data || []);
}

/**
 * Displays posts in admin panel
 */
function displayAdminPosts(posts) {
    const container = document.getElementById('admin-posts-list');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="color:#718096;">No posts yet. Create your first post!</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const createdDate = new Date(post.date_created).toLocaleDateString();
        const editedDate = post.date_edited 
            ? new Date(post.date_edited).toLocaleDateString() 
            : null;
        
        return `
            <div class="admin-post-item">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    Created: ${createdDate}
                    ${editedDate ? `| Edited: ${editedDate}` : ''}
                </div>
                <div class="post-actions">
                    <button class="edit-btn" onclick="window.editPost(${post.id})">Edit</button>
                    <button class="delete-btn" onclick="window.deletePost(${post.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Helper function to escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handles creating a new post with validation and rate limiting
 */
async function handleCreatePost(event) {
    event.preventDefault();
    
    // Check rate limiting
    const rateLimitCheck = postRateLimiter.recordAttempt();
    if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.reason);
        return;
    }
    
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    
    const validation = validateBlogPost(titleInput.value, contentInput.value);
    
    if (!validation.isValid) {
        alert('Validation errors:\n' + validation.errors.join('\n'));
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Publishing...';
    
    try {
        const { data, error } = await supabaseClient
            .from('blog_posts')
            .insert([{
                title: validation.sanitizedTitle,
                content: validation.sanitizedContent
            }])
            .select();
        
        if (error) {
            throw error;
        }
        
        // Clear form and draft
        titleInput.value = '';
        contentInput.value = '';
        clearDraft();
        
        // Reload posts
        await loadAdminPosts();
        
        alert('Post published successfully!');
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to publish post. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Publish Post';
    }
}

/**
 * Opens edit modal for a post
 */
async function editPost(postId) {
    const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();
    
    if (error) {
        console.error('Error loading post:', error);
        alert('Failed to load post');
        return;
    }
    
    currentEditingPostId = postId;
    
    document.getElementById('edit-post-title').value = data.title;
    document.getElementById('edit-post-content').value = data.content;
    document.getElementById('edit-modal').style.display = 'block';
}

/**
 * Handles updating a post
 */
async function handleUpdatePost(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('edit-post-title');
    const contentInput = document.getElementById('edit-post-content');
    
    const validation = validateBlogPost(titleInput.value, contentInput.value);
    
    if (!validation.isValid) {
        alert('Validation errors:\n' + validation.errors.join('\n'));
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    try {
        const { data, error } = await supabaseClient
            .from('blog_posts')
            .update({
                title: validation.sanitizedTitle,
                content: validation.sanitizedContent,
                date_edited: new Date().toISOString()
            })
            .eq('id', currentEditingPostId)
            .select();
        
        if (error) {
            throw error;
        }
        
        document.getElementById('edit-modal').style.display = 'none';
        await loadAdminPosts();
        alert('Post updated successfully!');
        
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Save Changes';
    }
}

/**
 * Deletes a post
 */
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('blog_posts')
            .delete()
            .eq('id', postId);
        
        if (error) {
            throw error;
        }
        
        await loadAdminPosts();
        alert('Post deleted successfully');
        
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
    }
}

/**
 * Draft management
 */
function setupAutoSaveDraft() {
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    
    if (!titleInput || !contentInput) return;
    
    // Load saved draft
    const savedTitle = localStorage.getItem('draftTitle');
    const savedContent = localStorage.getItem('draftContent');
    
    if (savedTitle) titleInput.value = savedTitle;
    if (savedContent) contentInput.value = savedContent;
    
    // Auto-save on input
    titleInput.addEventListener('input', () => {
        localStorage.setItem('draftTitle', titleInput.value);
    });
    
    contentInput.addEventListener('input', () => {
        localStorage.setItem('draftContent', contentInput.value);
    });
}

function clearDraft() {
    localStorage.removeItem('draftTitle');
    localStorage.removeItem('draftContent');
}

/**
 * Checks if user is already authenticated on page load
 */
async function checkExistingSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        document.getElementById('login-card').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        await loadAdminPosts();
    }
}

/**
 * Initialize admin panel
 */
async function initializeAdmin() {
    // Setup character counters
    setupCharacterCounters();
    
    // Setup event listeners
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const newPostForm = document.getElementById('new-post-form');
    if (newPostForm) {
        newPostForm.addEventListener('submit', handleCreatePost);
    }
    
    const editPostForm = document.getElementById('edit-post-form');
    if (editPostForm) {
        editPostForm.addEventListener('submit', handleUpdatePost);
    }
    
    const clearDraftBtn = document.getElementById('clear-draft-btn');
    if (clearDraftBtn) {
        clearDraftBtn.addEventListener('click', () => {
            if (confirm('Clear draft?')) {
                document.getElementById('post-title').value = '';
                document.getElementById('post-content').value = '';
                clearDraft();
            }
        });
    }
    
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
    }
    
    const closeBtn = document.querySelector('.close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
    }
    
    // Setup auto-save
    setupAutoSaveDraft();
    
    // Check existing session
    await checkExistingSession();
}

// Make functions available globally for onclick handlers
window.editPost = editPost;
window.deletePost = deletePost;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}