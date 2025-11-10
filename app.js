// Blog functionality with Supabase

import { checkAuthStatus, setupLoginModal, getAuthStatus } from './authCheck.js';
import { 
    addNewBlogPost, 
    loadBlogPosts, 
    displayBlogPosts, 
    setupAutoSaveDraft 
} from './CRUD_BlogPost.js';

// Listen for auth status changes and refresh the display
window.addEventListener('authStatusChanged', () => {
    displayBlogPosts();
});

function daysSinceStart() 
{
    const startDate = "11/01/2025";
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function displayDaysSinceStart() 
{
    const days = daysSinceStart();
    const daysDisplayed = "It has been " + days + " day" + (days !== 1 ? "s" : "") + " since I started learning Javascript!";
    const daysDiv = document.getElementById("days");
    if (daysDiv) 
    {
        daysDiv.textContent = daysDisplayed;
    }
}

window.addEventListener("DOMContentLoaded", displayDaysSinceStart);

async function initializeApp() 
{
    setupLoginModal();
    await checkAuthStatus();
    await loadBlogPosts();
}

window.addEventListener("DOMContentLoaded", initializeApp);
window.addEventListener("DOMContentLoaded", setupAutoSaveDraft);

// Make addNewBlogPost available globally for the HTML onclick attribute
window.addNewBlogPost = addNewBlogPost;
