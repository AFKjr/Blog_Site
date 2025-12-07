// Functions for displaying posts in the admin panel

import { escapeHtml } from './uiHelpers.js';

/**
 * Displays posts in admin panel
 */
export function displayAdminPosts(posts) {
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
                    <button class="edit-btn" onclick="window.editPost('${post.id}')">Edit</button>
                    <button class="delete-btn" onclick="window.deletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}
