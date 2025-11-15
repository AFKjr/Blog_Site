// Authentication functionality for public blog (read-only)
// Admin login has been moved to admin.html

import { supabaseClient } from './supabaseImport.js';

let isAuthenticated = false;

/**
 * Checks if user is authenticated (for showing edit/delete buttons)
 */
async function checkAuthStatus() 
{
    const { data: { session } } = await supabaseClient.auth.getSession();
    isAuthenticated = !!session;
    updateUIForAuthStatus();
    return isAuthenticated;
}

/**
 * Updates UI based on authentication status
 * Shows/hides edit and delete buttons on blog posts
 */
function updateUIForAuthStatus() 
{
    // Trigger a custom event that app.js can listen to
    window.dispatchEvent(new CustomEvent('authStatusChanged', { 
        detail: { isAuthenticated } 
    }));
}

/**
 * Returns current authentication status
 */
function getAuthStatus() 
{
    return isAuthenticated;
}

/**
 * Logout function (can be called from public blog if needed)
 */
async function logoutAdmin() 
{
    await supabaseClient.auth.signOut();
    await checkAuthStatus();
    // Redirect to home page after logout
    window.location.href = 'index.html';
}

export { 
    checkAuthStatus, 
    updateUIForAuthStatus, 
    getAuthStatus,
    logoutAdmin
};
