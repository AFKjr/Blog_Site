// CRUD operations for blog posts

import { supabaseClient } from './supabaseImport.js';
import { getAuthStatus } from './authCheck.js';

// The array for holding all blog posts
let blogPosts = [];
let currentEditingPostId = null;

// Create - Add new blog post
async function addNewBlogPost() 
{
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;

    if (title.trim() === "" || content.trim() === "")
    {
        alert("Please fill in both the title and content fields.");
        return;
    }
    
    if (!getAuthStatus()) {
        alert("You must be logged in to add posts.");
        return;
    }

    // Insert into Supabase
    const { data, error } = await supabaseClient
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

// Read - Load all blog posts
async function loadBlogPosts()
{
    const { data, error } = await supabaseClient
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

// Display blog posts
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
        
    
        if (getAuthStatus()) {
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

// Update - Edit existing blog post
async function editBlogPost(id)
{
    if (!getAuthStatus()) {
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

// Save edited post
async function saveEditedPost()
{
    const editTitleInput = document.getElementById("edit-post-title");
    const editContentTextarea = document.getElementById("edit-post-content");
    
    const { data, error } = await supabaseClient
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

// Delete - Remove blog post
async function deleteBlogPost(id)
{
    if (!getAuthStatus()) {
        alert("You must be logged in to delete posts.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this post?"))
    {
        const { error } = await supabaseClient
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

// Draft management functions
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

export { 
    addNewBlogPost, 
    loadBlogPosts, 
    displayBlogPosts, 
    editBlogPost, 
    deleteBlogPost,
    setupAutoSaveDraft,
    clearDraft
};
