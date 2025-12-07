// Event handler setup for admin panel

import { handleLogin, handleLogout } from './auth.js';
import { handleCreatePost, handleUpdatePost } from './postManager.js';
import { setupAutoSaveDraft, clearDraft } from './draftManager.js';

/**
 * Sets up all event listeners for the admin panel
 */
export function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // New post form
    const newPostForm = document.getElementById('new-post-form');
    if (newPostForm) {
        newPostForm.addEventListener('submit', handleCreatePost);
    }

    // Edit post form
    const editPostForm = document.getElementById('edit-post-form');
    if (editPostForm) {
        editPostForm.addEventListener('submit', handleUpdatePost);
    }

    // Clear draft button
    const clearDraftBtn = document.getElementById('clear-draft-btn');
    if (clearDraftBtn) {
        clearDraftBtn.addEventListener('click', () => {
            if (confirm('Clear draft?')) {
                document.getElementById('post-title').value = '';
                if (window.quillNewPost) {
                    window.quillNewPost.setText('');
                }
                clearDraft();
            }
        });
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
    }

    // Close modal button
    const closeBtn = document.querySelector('.close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
    }

    // Setup auto-save for drafts
    setupAutoSaveDraft();
}
