import { supabase } from './config.js';
import { config } from './config.js';

const { createClient } = supabase;
const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);

export { supabaseClient };
