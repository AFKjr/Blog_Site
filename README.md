# Afkjr.dev - Blog Site

A full-stack blog application built with modern web technologies. This project serves as a personal learning journal and blog platform to document my web development journey.

## Features

### Public Blog (index.html)
- **Days Counter**: Tracks and displays the number of days since starting to learn web development
- **Blog Posts Display**: Read all published blog posts with rich text formatting
- **Rich Text Content**: Blog posts support formatted text, code blocks with syntax highlighting, images, and links
- **Projects Page**: Dedicated page showcasing my web development projects
- **Responsive Design**: Clean, modern UI that works on different screen sizes
- **Conditional Admin Controls**: Edit/delete buttons visible only when authenticated

### Admin Panel (admin/admin.html)
- **Secure Authentication**: Email/password login using Supabase Auth
- **Rich Text Editor**: Quill editor with full formatting toolbar including:
  - Headers, bold, italic, underline, strikethrough
  - Text colors and background colors
  - Ordered and bulleted lists
  - Text alignment options
  - Blockquotes and code blocks with syntax highlighting
  - Links and images
- **Create Posts**: Publish new blog posts with rich formatting
- **Edit Posts**: Update existing posts with inline editing
- **Delete Posts**: Remove posts with confirmation
- **Auto-Save Drafts**: Automatically saves draft content to prevent loss
- **Input Validation**: Character limits and sanitization (200 chars for title, 20,000 for content)
- **Rate Limiting**: Protection against spam and abuse

## Technologies Used

### Frontend
- HTML5
- CSS3 (Modular architecture with separate stylesheets)
- JavaScript (ES6+ Modules)
- [Quill](https://quilljs.com/) - Rich text editor
- [highlight.js](https://highlightjs.org/) - Syntax highlighting for code blocks

### Backend & Database
- [Supabase](https://supabase.com/) - Backend-as-a-Service
  - PostgreSQL database for blog posts
  - Authentication system
  - Real-time data synchronization

### Security Features
- Input validation and sanitization
- Rate limiting for post creation
- Authenticated endpoints for CRUD operations
- XSS protection

## Project Structure

```
Blog_Site/
├── index.html              # Main public blog page
├── app.js                  # Public blog functionality
├── projects.html           # Projects showcase page
├── styles.css              # Main stylesheet
├── admin/
│   ├── admin.html         # Admin panel interface
│   ├── admin.js           # Admin panel initialization
│   ├── auth.js            # Authentication logic
│   ├── postManager.js     # Post creation/editing
│   ├── postDisplay.js     # Admin post display
│   ├── draftManager.js    # Draft auto-save functionality
│   ├── eventHandlers.js   # Event handler setup
│   ├── uiHelpers.js       # UI utility functions
│   └── css/               # Modular admin stylesheets
│       ├── admin-layout.css
│       ├── admin-forms.css
│       ├── admin-buttons.css
│       └── quill-editor.css
├── css/                    # Public blog stylesheets
│   ├── variables.css
│   ├── base.css
│   ├── header.css
│   ├── blog-posts.css
│   ├── modal.css
│   └── responsive.css
├── CRUD_BlogPost.js        # CRUD operations for blog posts
├── authCheck.js            # Authentication status checking
├── inputValidation.js      # Input validation and sanitization
├── rateLimiting.js         # Rate limiting logic
├── supabaseImport.js       # Supabase client initialization
└── config.js               # Configuration (not in repo)
```

## Setup

1. Clone the repository
2. Create a `config.js` file based on `config.example.js` with your Supabase credentials:
   ```javascript
   export const supabaseConfig = {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```
3. Set up a Supabase project with a `blog_posts` table
4. Configure authentication in Supabase
5. Serve the files using a local web server (required for ES6 modules)

## Usage

- Visit `index.html` to view the public blog
- Visit `admin/admin.html` to access the admin panel (requires authentication)
- Login with your Supabase credentials to create, edit, or delete posts