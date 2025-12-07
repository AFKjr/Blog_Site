// Main admin panel initialization - modularized structure

import { setupCharacterCounters } from '../inputValidation.js';
import { checkExistingSession } from './auth.js';
import { editPost, deletePost } from './postManager.js';
import { setupEventListeners } from './eventHandlers.js';

/**
 * Initialize admin panel
 */
async function initializeAdmin() {
    // Setup character counters
    setupCharacterCounters();

    // Setup all event listeners
    setupEventListeners();

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
