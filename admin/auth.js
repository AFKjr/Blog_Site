// Authentication functionality for admin panel

import { supabaseClient } from '../supabaseImport.js';
import { loginRateLimiter } from '../rateLimiting.js';
import { showError, clearError } from './uiHelpers.js';
import { loadAdminPosts } from './postManager.js';

/**
 * Handles admin login with rate limiting
 */
export async function handleLogin(event) {
    event.preventDefault();

    // check rate limiting
    const rateLimitCheck = loginRateLimiter.recordAttempt();
    if (!rateLimitCheck.allowed) {
        showError('login-error', rateLimitCheck.reason);
        document.getElementById('login-btn').disabled = true;

        setTimeout(() => {
            document.getElementById('login-btn').disabled = false;
        }, 5000); // 5 seconds

        return;
    }

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    clearError('login-error');

    if (!email || !password) {
        showError('login-error', 'Email and password are required.');
        return;
    }

    const LoginButton = document.getElementById('login-btn');
    LoginButton.disabled = true;
    LoginButton.textContent = 'Logging in...';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        // Successful login - reset rate limiter
        loginRateLimiter.reset();

        // clear form
        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';

        // Show admin panel
        document.getElementById('login-card').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';

        // Load posts
        await loadAdminPosts();

    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Invalid email or password');
    } finally {
        LoginButton.disabled = false;
        LoginButton.textContent = 'Login';
    }
}

/**
 * Handles logout
 */
export async function handleLogout() {
    await supabaseClient.auth.signOut();
    document.getElementById('login-card').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    window.location.href = 'index.html';
}

/**
 * Checks if user is already authenticated on page load
 */
export async function checkExistingSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        document.getElementById('login-card').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        await loadAdminPosts();
    }
}
