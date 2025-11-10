// Authentication functionality

import { supabaseClient } from './supabaseImport.js';

let isAuthenticated = false;
let clickCount = 0;

async function checkAuthStatus() 
{
    const { data: { session } } = await supabaseClient.auth.getSession();
    isAuthenticated = !!session;
    updateUIForAuthStatus();
    return isAuthenticated;
}

function updateUIForAuthStatus() 
{
    const addPostSection = document.querySelector('.add-post');
    const logoutContainer = document.getElementById('logout-container');
    
    if (isAuthenticated) 
        {
        if (addPostSection) addPostSection.style.display = 'block';
        if (logoutContainer) logoutContainer.style.display = 'block';
    } else 
    {
        if (addPostSection) addPostSection.style.display = 'none';
        if (logoutContainer) logoutContainer.style.display = 'none';
    }
    
    // Trigger a custom event that app.js can listen to
    window.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { isAuthenticated } }));
}

async function loginAdmin() 
{
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!email || !password) 
    {
        errorDiv.textContent = 'Please enter both email and password';
        return;
    }
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) 
    {
        errorDiv.textContent = error.message;
    } else 
    {
        errorDiv.textContent = '';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';
        await checkAuthStatus();
    }
}

async function logoutAdmin() 
{
    await supabaseClient.auth.signOut();
    await checkAuthStatus();
}

function setupLoginModal() 
{
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.querySelector('.close-login');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const headerContainer = document.getElementById('header-container');

    if (headerContainer) {
        headerContainer.addEventListener('click', () => {
            clickCount++;
            console.log('Click count:', clickCount); // Debug log
            if (clickCount === 5) {
                loginModal.style.display = 'block';
                clickCount = 0;
            }
            setTimeout(() => { clickCount = 0; }, 2000);
        });
    }
    
    if (closeLogin) 
    {
        closeLogin.onclick = () => {
            loginModal.style.display = 'none';
        };
    }
    
    if (loginBtn) 
    {
        loginBtn.onclick = loginAdmin;
    }
    
    if (logoutBtn) 
    {
        logoutBtn.onclick = logoutAdmin;
    }
    ['admin-email', 'admin-password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginAdmin();
            });
        }
    });
}

function getAuthStatus() {
    return isAuthenticated;
}

export { checkAuthStatus, updateUIForAuthStatus, loginAdmin, logoutAdmin, setupLoginModal, getAuthStatus };
