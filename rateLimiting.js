// Rate limiting utilities to prevent spam

const RATE_LIMIT_CONFIG = 
{
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_POSTS_PER_HOUR: 10,
    POST_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    LOCKOUT_DURATION_MS: 30 * 60 * 1000 // 30 minutes
};

class RateLimiter 
{
    constructor(storageKey, maxAttempts, windowMs) 
    {
        this.storageKey = storageKey;
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    /**
     * Gets current rate limit data from localStorage
     */
    getData() 
    {
        const data = localStorage.getItem(this.storageKey);
        if (!data) {
            return {
                attempts: [],
                lockedUntil: null
            };
        }
        return JSON.parse(data);
    }

    /**
     * Saves rate limit data to localStorage
     */
    saveData(data) 
    {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    /**
     * Checks if currently locked out
     */
    isLockedOut() 
    {
        const data = this.getData();
        if (!data.lockedUntil) return false;
        
        const now = Date.now();
        if (now < data.lockedUntil) 
        {
            const remainingMs = data.lockedUntil - now;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return {
                locked: true,
                remainingMinutes: remainingMinutes
            };
        }
        
        // Lockout expired, clear it
        data.lockedUntil = null;
        this.saveData(data);
        return { locked: false };
    }

    /**
     * Records an attempt and checks if rate limit exceeded
     */
    recordAttempt() 
    {
        const lockStatus = this.isLockedOut();
        if (lockStatus.locked) 
        {
            return {
                allowed: false,
                reason: `Too many attempts. Please try again in ${lockStatus.remainingMinutes} minute(s).`
            };
        }

        const data = this.getData();
        const now = Date.now();
        
        // Remove attempts outside the time window
        data.attempts = data.attempts.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        // Check if limit exceeded
        if (data.attempts.length >= this.maxAttempts) 
        {
            data.lockedUntil = now + RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MS;
            this.saveData(data);
            
            const lockoutMinutes = Math.ceil(RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MS / 60000);
            return {
                allowed: false,
                reason: `Rate limit exceeded. Locked out for ${lockoutMinutes} minutes.`
            };
        }
        
        // Record this attempt
        data.attempts.push(now);
        this.saveData(data);
        
        return {
            allowed: true,
            remainingAttempts: this.maxAttempts - data.attempts.length
        };
    }

    /**
     * Resets the rate limiter (call on successful action)
     */
    reset() 
    {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Gets remaining attempts
     */
    getRemainingAttempts() 
    {
        const data = this.getData();
        const now = Date.now();
        
        const recentAttempts = data.attempts.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        return Math.max(0, this.maxAttempts - recentAttempts.length);
    }
}

// Create rate limiters for different actions
const loginRateLimiter = new RateLimiter(
    'login_attempts',
    RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS,
    RATE_LIMIT_CONFIG.LOGIN_ATTEMPT_WINDOW_MS
);

const postRateLimiter = new RateLimiter(
    'post_attempts',
    RATE_LIMIT_CONFIG.MAX_POSTS_PER_HOUR,
    RATE_LIMIT_CONFIG.POST_WINDOW_MS
);

export 
{
    loginRateLimiter,
    postRateLimiter,
    RATE_LIMIT_CONFIG
};