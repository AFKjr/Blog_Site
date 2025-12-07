// Post CRUD operations for admin panel

import { supabaseClient } from '../supabaseImport.js';
import { validateBlogPost } from '../inputValidation.js';
import { postRateLimiter } from '../rateLimiting.js';
import { displayAdminPosts } from './postDisplay.js';
import { clearDraft } from './draftManager.js';

let currentEditingPostId = null;

/**
 * Loads all posts for admin management
 */
export async function loadAdminPosts() {
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
 * Handles creating a new post with validation and rate limiting
 */
export async function handleCreatePost(event) {
    event.preventDefault();

    // Check rate limiting
    const rateLimitCheck = postRateLimiter.recordAttempt();
    if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.reason);
        return;
    }

    const titleInput = document.getElementById('post-title');

    // Get content from Quill editor
    const content = window.quillNewPost ? window.quillNewPost.root.innerHTML : '';

    const validation = validateBlogPost(titleInput.value, content);

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
        if (window.quillNewPost) {
            window.quillNewPost.setText('');
        }
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
export async function editPost(postId) {
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
    document.getElementById('edit-modal').style.display = 'block';

    // Wait for Quill to initialize and set content
    setTimeout(() => {
        if (window.quillEditPost) {
            window.quillEditPost.root.innerHTML = data.content;
        }
    }, 100);
}

/**
 * Handles updating a post
 */
export async function handleUpdatePost(event) {
    event.preventDefault();

    const titleInput = document.getElementById('edit-post-title');

    // Get content from Quill editor
    const content = window.quillEditPost ? window.quillEditPost.root.innerHTML : '';

    const validation = validateBlogPost(titleInput.value, content);

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
export async function deletePost(postId) {
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
