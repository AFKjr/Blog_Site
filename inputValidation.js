// Input validation and sanitization utilities

const INPUT_LIMITS = 
{
    TITLE_MAX_LENGTH: 200,
    CONTENT_MAX_LENGTH: 20000,
    TITLE_MIN_LENGTH: 3,
    CONTENT_MIN_LENGTH: 10
};

/**
 * Sanitizes user input to prevent XSS attacks
 * Escapes HTML special characters
 */
function sanitizeInput(input) 
{
    if (typeof input !== 'string') {
        return '';
    }
    
    const element = document.createElement('div');
    element.textContent = input;
    return element.innerHTML;
}

/**
 * Validates blog post title
 */
function validateTitle(title) 
{
    const errors = [];
    
    if (!title || title.trim().length === 0) 
    {
        errors.push('Title is required');
    }
    
    if (title.trim().length < INPUT_LIMITS.TITLE_MIN_LENGTH) 
    {
        errors.push(`Title must be at least ${INPUT_LIMITS.TITLE_MIN_LENGTH} characters`);
    }
    
    if (title.length > INPUT_LIMITS.TITLE_MAX_LENGTH) 
    {
        errors.push(`Title cannot exceed ${INPUT_LIMITS.TITLE_MAX_LENGTH} characters`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validates blog post content
 */
function validateContent(content) 
{
    const errors = [];
    
    if (!content || content.trim().length === 0) 
    {
        errors.push('Content is required');
    }
    
    if (content.trim().length < INPUT_LIMITS.CONTENT_MIN_LENGTH) 
    {
        errors.push(`Content must be at least ${INPUT_LIMITS.CONTENT_MIN_LENGTH} characters`);
    }
    
    if (content.length > INPUT_LIMITS.CONTENT_MAX_LENGTH) 
    {
        errors.push(`Content cannot exceed ${INPUT_LIMITS.CONTENT_MAX_LENGTH} characters`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validates both title and content
 * Returns sanitized values and any errors
 */
function validateBlogPost(title, content) 
{
    const titleValidation = validateTitle(title);
    const contentValidation = validateContent(content);
    
    const allErrors = [...titleValidation.errors, ...contentValidation.errors];
    
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        sanitizedTitle: sanitizeInput(title.trim()),
        sanitizedContent: sanitizeInput(content.trim())
    };
}

/**
 * Updates character count display for Quill editors and regular inputs
 */
function updateCharacterCount(inputId, countId, maxLength) 
{
    const element = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    
    if (!element || !counter) return;
    
    const updateCount = () =>
    {
        let currentLength = 0;

        // Verify element still exists and is accessible
        if (!element || !counter) return;

        // Check if it's a regular input (like title field)
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            currentLength = element.value ? element.value.length : 0;
        } else {
            // It's a Quill editor container - get text length from editor
            const quillEditor = element.querySelector('.ql-editor');
            if (quillEditor && quillEditor.textContent) {
                currentLength = quillEditor.textContent.length;
            }
        }

        counter.textContent = `${currentLength} / ${maxLength}`;

        if (currentLength > maxLength * 0.9)
        {
            counter.style.color = '#e53e3e';
        }
        else if (currentLength > maxLength * 0.75)
        {
            counter.style.color = '#ed8936';
        }
        else
        {
            counter.style.color = '#718096';
        }
    };
    
    // Set up appropriate event listener
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.addEventListener('input', updateCount);
    } else {
        // For Quill editors, use MutationObserver
        const observer = new MutationObserver(updateCount);
        observer.observe(element, { 
            childList: true, 
            subtree: true, 
            characterData: true 
        });
    }
    
    updateCount();
}

/**
 * Sets up character counters for all inputs
 */
function setupCharacterCounters() 
{
    updateCharacterCount('post-title', 'title-count', INPUT_LIMITS.TITLE_MAX_LENGTH);
    updateCharacterCount('post-content', 'content-count', INPUT_LIMITS.CONTENT_MAX_LENGTH);
    updateCharacterCount('edit-post-title', 'edit-title-count', INPUT_LIMITS.TITLE_MAX_LENGTH);
    updateCharacterCount('edit-post-content', 'edit-content-count', INPUT_LIMITS.CONTENT_MAX_LENGTH);
}

export 
{
    sanitizeInput,
    validateTitle,
    validateContent,
    validateBlogPost,
    updateCharacterCount,
    setupCharacterCounters,
    INPUT_LIMITS
};