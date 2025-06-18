import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants.js';

let supabase = null;

export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      // For tests, we'll use our mock Supabase client from the mock setup
      supabase = global.__TEST_SUPABASE_CLIENT__;
      if (!supabase) {
        throw new Error('Test Supabase client not initialized');
      }
      console.log('Connected to mock Supabase database');
      return supabase;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test the connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is ok for initial setup
      throw error;
    }
    
    console.log(`Supabase Connected: ${SUPABASE_URL}`);
    return supabase;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call connectDB() first.');
  }
  return supabase;
};