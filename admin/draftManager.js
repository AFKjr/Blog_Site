// Draft auto-save and management functionality

/**
 * Sets up auto-save functionality for drafts
 */
export function setupAutoSaveDraft() {
    const titleInput = document.getElementById('post-title');

    if (!titleInput) return;

    // Load saved draft
    const savedTitle = localStorage.getItem('draftTitle');
    const savedContent = localStorage.getItem('draftContent');

    if (savedTitle) titleInput.value = savedTitle;

    // Auto-save on input
    titleInput.addEventListener('input', () => {
        localStorage.setItem('draftTitle', titleInput.value);
    });

    // Auto-save Quill content
    // Wait for Quill to initialize
    const checkQuill = setInterval(() => {
        if (window.quillNewPost) {
            // Load saved content if exists
            if (savedContent) {
                window.quillNewPost.root.innerHTML = savedContent;
            }

            // Save on text change
            window.quillNewPost.on('text-change', () => {
                localStorage.setItem('draftContent', window.quillNewPost.root.innerHTML);
            });

            clearInterval(checkQuill);
        }
    }, 100);
}

/**
 * Clears saved draft from localStorage
 */
export function clearDraft() {
    localStorage.removeItem('draftTitle');
    localStorage.removeItem('draftContent');
}
