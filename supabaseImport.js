// Supabase client initialization
// This file imports the config and creates the Supabase client

import { config } from './config.js';

// Access the Supabase library from the global window object (loaded via CDN in HTML)
const { createClient } = window.supabase;

// Create and export the Supabase client
const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);

export { supabaseClient };