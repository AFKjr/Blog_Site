import { config } from './config.js';

// Access the Supabase library from the global window object (loaded via CDN)
const { createClient } = window.supabase;
const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);

export { supabaseClient };
