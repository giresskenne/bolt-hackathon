import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from './constants.js';

let supabase = null;

export const connectDB = async () => {
  try {
    console.log('Connecting to Supabase...');
    console.log('Supabase URL:', getSupabaseUrl());
    console.log('Supabase Key prefix:', getSupabaseAnonKey()?.substring(0, 10) + '...');

    supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    
    // Test the connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is ok for initial setup
      throw error;
    }
    
    console.log(`Supabase Connected: ${getSupabaseUrl()}`);
    return supabase;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call connectDB() first.');
  }
  return supabase;
};