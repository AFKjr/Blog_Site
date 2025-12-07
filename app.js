// Blog functionality for public view
// Admin functions moved to admin.html

import { checkAuthStatus, getAuthStatus, logoutAdmin } from './authCheck.js';
import { 
    loadBlogPosts, 
    displayBlogPosts
} from './CRUD_BlogPost.js';
import { supabaseClient } from './supabaseImport.js';

// Listen for auth status changes and refresh the display
window.addEventListener('authStatusChanged', () => {
    displayBlogPosts();
    updateLogoutButton();
});

/**
 * Calculates days since starting JavaScript
 */
function daysSinceStart() 
{
    const startDate = "11/01/2025";
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Displays the day counter
 */
function displayDaysSinceStart() 
{
    const days = daysSinceStart();
    const daysDisplayed = "It has been " + days + " day" + (days !== 1 ? "s" : "") + " since I started learning web development!";
    const daysDiv = document.getElementById("days");
    if (daysDiv) 
    {
        daysDiv.textContent = daysDisplayed;
    }
}

/**
 * Shows/hides logout button based on auth status
 */
function updateLogoutButton() 
{
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
        logoutContainer.style.display = getAuthStatus() ? 'block' : 'none';
    }
}

/**
 * Sets up logout button click handler
 */
function setupLogoutButton() 
{
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logoutAdmin();
        });
    }
}

/**
 * Initialize the application
 */
async function initializeApp() 
{
    await checkAuthStatus();
    await loadBlogPosts();
    setupLogoutButton();
    updateLogoutButton();
}

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", displayDaysSinceStart);
window.addEventListener("DOMContentLoaded", initializeApp);
