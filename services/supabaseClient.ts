
import { createClient } from '@supabase/supabase-js';

// Environment variables are preferred, but placeholders prevent the app from crashing on load
// Users can configure these in their own environment for real backend integration
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isDemoMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
