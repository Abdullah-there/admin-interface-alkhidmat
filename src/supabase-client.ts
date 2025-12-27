// src/supabase-client.ts (or wherever @/ points to)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // or VITE_SUPABASE_PUBLISHABLE_KEY

// Optional: Add debug logs (remove later)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey?.substring(0, 10) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);