// Supabase client for the frontend (Vite)
import { createClient } from '@supabase/supabase-js';

// Uses Vite environment variables. Replace these values in `frontend/.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
