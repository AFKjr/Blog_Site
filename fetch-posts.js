// script to fetch posts

const { data: posts, error } = await supabaseClient
    .from('blog_posts')
    .select('*')
    .order('date_created', { ascending: false });

// Loop through posts and use each post's ID
posts.forEach(post => {
    const linkElement = document.createElement('a');
    linkElement.href = `post.html?postId=${post.id}`;
    linkElement.textContent = post.title;