// Blog functionality with Supabase

// The array for holding all blog posts
let blogPosts = [];
let currentEditingPostId = null;
let isAuthenticated = false;
let clickCount = 0;

async function checkAuthStatus() 
{
    const { data: { session } } = await supabase.auth.getSession();
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
    displayBlogPosts();
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
    
    const { data, error } = await supabase.auth.signInWithPassword({
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
    await supabase.auth.signOut();
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

async function addNewBlogPost() 
{
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;

    if (title.trim() === "" || content.trim() === "")
    {
        alert("Please fill in both the title and content fields.");
        return;
    }
    
    if (!isAuthenticated) {
        alert("You must be logged in to add posts.");
        return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
        .from('blog_posts')
        .insert([
            { 
                title: title, 
                content: content 
            }
        ])
        .select();
    
    if (error) {
        console.error('Error adding post:', error);
        alert('Error adding post: ' + error.message);
    } else {
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";
        clearDraft();
        await loadBlogPosts();
    }
}

async function loadBlogPosts()
{
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date_created', { ascending: false });
    
    if (error) {
        console.error('Error loading posts:', error);
    } else {
        blogPosts = data || [];
        displayBlogPosts();
    }
}

function displayBlogPosts()
{
    const blogContainer = document.getElementById("blog-posts");

    if (!blogContainer) return;
    
    blogContainer.innerHTML = "";
    for (let index = 0; index < blogPosts.length; index++) 
    {
        const post = blogPosts[index];
        
        const postDiv = document.createElement("div");
        postDiv.className = "blog-post";
        
        const title = document.createElement("h2");
        title.textContent = post.title;
        
        const date = document.createElement("p");
        const dateEm = document.createElement("em");
        const postDate = new Date(post.date_created).toLocaleDateString();
        dateEm.textContent = `Posted on: ${postDate}`;
        if (post.date_edited) {
            const editDate = new Date(post.date_edited).toLocaleDateString();
            dateEm.textContent += ` (Edited: ${editDate})`;
        }
        date.appendChild(dateEm);
        
        const content = document.createElement("p");
        content.textContent = post.content;
        content.style.whiteSpace = "pre-wrap";
        
        postDiv.appendChild(title);
        postDiv.appendChild(date);
        postDiv.appendChild(content);
        
    
        if (isAuthenticated) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.onclick = function() { editBlogPost(post.id); };
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = function() { deleteBlogPost(post.id); };
            
            postDiv.appendChild(editBtn);
            postDiv.appendChild(deleteBtn);
        }
        
        blogContainer.appendChild(postDiv);
    }
}

function setupAutoSaveDraft() 
{
    const postTitle = document.getElementById("post-title");
    const postContent = document.getElementById("post-content");
    const savedTitle = localStorage.getItem("draftTitle");
    const savedContent = localStorage.getItem("draftContent");
    
    if (savedTitle) 
    {
        postTitle.value = savedTitle;
    }
    if (savedContent) 
    {
        postContent.value = savedContent;
    }
    
    postTitle.addEventListener("keyup", function() {
        localStorage.setItem("draftTitle", postTitle.value);
    });
    
    postContent.addEventListener("keyup", function() {
        localStorage.setItem("draftContent", postContent.value);
    });
}

function clearDraft() 
{
    localStorage.removeItem("draftTitle");
    localStorage.removeItem("draftContent");
}

window.addEventListener("DOMContentLoaded", setupAutoSaveDraft);

async function editBlogPost(id)
{
    if (!isAuthenticated) {
        alert("You must be logged in to edit posts.");
        return;
    }
    
    const editedPost = blogPosts.find(post => post.id === id);
    if (editedPost)
    {
        const modal = document.getElementById("Modal");
        const closeButton = document.querySelector(".close-button");
        const saveChangesBtn = document.getElementById("save-changes-btn");
        const cancelChangesBtn = document.getElementById("Cancel-changes-btn");
        const editTitleInput = document.getElementById("edit-post-title");
        const editContentTextarea = document.getElementById("edit-post-content"); 

        
        editTitleInput.value = editedPost.title;
        editContentTextarea.value = editedPost.content;
        modal.style.display = "block";
        currentEditingPostId = id;


        closeButton.onclick = function() {
            modal.style.display = "none";  
        }
        cancelChangesBtn.onclick = function() {
            modal.style.display = "none";
        }
        saveChangesBtn.onclick = async function() {
            await saveEditedPost();
            modal.style.display = "none";
        }
    }
}

async function saveEditedPost()
{
    const editTitleInput = document.getElementById("edit-post-title");
    const editContentTextarea = document.getElementById("edit-post-content");
    
    const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
            title: editTitleInput.value,
            content: editContentTextarea.value,
            date_edited: new Date().toISOString()
        })
        .eq('id', currentEditingPostId)
        .select();
    
    if (error) {
        console.error('Error updating post:', error);
        alert('Error updating post: ' + error.message);
    } else {
        await loadBlogPosts();
    }
}

async function deleteBlogPost(id)
{
    if (!isAuthenticated) {
        alert("You must be logged in to delete posts.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this post?"))
    {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting post:', error);
            alert('Error deleting post: ' + error.message);
        } else {
            await loadBlogPosts();
        }
    }
}


async function initializeApp() 
{
    setupLoginModal();
    await checkAuthStatus();
    await loadBlogPosts();
}

window.addEventListener("DOMContentLoaded", initializeApp);
