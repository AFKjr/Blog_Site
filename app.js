// Blog functionality

// The array for holding all blog posts
let blogPosts = [];

let currentEditingPostId = null;

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


function addNewBlogPost() 
{
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;

    if (title.trim() === "" || content.trim() === "")
    {
        alert("Please fill in both the title and content fields.");
    }else
    {
        // Create new blog post object
        const newPost = 
        {
            title: title,
            content: content,
            dateCreated: new Date().toLocaleDateString(),
            id: Math.floor(Math.random() * 1000000)
        }
        blogPosts.push(newPost);
        saveBlogPosts();
        displayBlogPosts();
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";
        clearDraft(); // Clear the saved draft after posting
    }
}

function saveBlogPosts() 
{
    localStorage.setItem("blogPosts", JSON.stringify(blogPosts));
}

function displayBlogPosts()
{
    const blogContainer = document.getElementById("blog-posts");

    //Get blog container
    blogContainer.innerHTML = "";
    for (let index = 0; index < blogPosts.length; index++) 
    {
        const post = blogPosts[index];
        // Create the HTML this posr using the newPost object
        const postDiv = document.createElement("div");
        postDiv.className = "blog-post";
        postDiv.innerHTML = `
        <h2>${post.title}</h2>
        <p><em>Posted on: ${post.dateCreated}</em></p>
        <p>${post.content}</p>
        <button onclick="editBlogPost(${post.id})">Edit</button>
        <button onclick="deleteBlogPost(${post.id})">Delete</button>
        <hr>
        `;
    blogContainer.appendChild(postDiv);
    }
}

function loadBlogPosts()
{
    console.log("Loading blog posts from localStorage...");
    const storedPosts = localStorage.getItem("blogPosts");
    console.log("Stored posts:", storedPosts);
    if (storedPosts) 
    {
        blogPosts = JSON.parse(storedPosts);
        console.log("Parsed blog posts:", blogPosts);
        displayBlogPosts();
        console.log("Blog posts displayed.");
    }
}
window.addEventListener("DOMContentLoaded", loadBlogPosts);

// *******
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

// *******

function editBlogPost(id)
{
    const editedPost = blogPosts.find(post => post.id === id);
    if (editedPost)
    {
        const modal = document.getElementById("Modal");
        const closeButton = document.querySelector(".close-button");
        const saveChangesBtn = document.getElementById("save-changes-btn");
        const cancelChangesBtn = document.getElementById("Cancel-changes-btn");
        const editTitleInput = document.getElementById("edit-post-title");
        const editContentTextarea = document.getElementById("edit-post-content"); 

        // Populate modal with current post data
        editTitleInput.value = editedPost.title;
        editContentTextarea.value = editedPost.content;
        modal.style.display = "block";
        currentEditingPostId = id;

        //Click handlers
        closeButton.onclick = function() {
        modal.style.display = "none";  
        }
        cancelChangesBtn.onclick = function() {
        modal.style.display = "none";
        }
        saveChangesBtn.onclick = function() {
            saveEditedPost();
            modal.style.display = "none";
        }
    }
}

function saveEditedPost()
{
    const editTitleInput = document.getElementById("edit-post-title");
    const editContentTextarea = document.getElementById("edit-post-content");
    const editedPost = blogPosts.find(post => post.id === currentEditingPostId);
    if (editedPost) 
    {
        editedPost.title = editTitleInput.value;
        editedPost.content = editContentTextarea.value;
        editedPost.dateEdited = new Date().toLocaleDateString();
        saveBlogPosts();
        displayBlogPosts();
    }
}

function deleteBlogPost(id)
{
    if (confirm("Are you sure you want to delete this post?"))
    {
        blogPosts = blogPosts.filter(post => post.id !== id);
        saveBlogPosts();
        displayBlogPosts();
    }
}
