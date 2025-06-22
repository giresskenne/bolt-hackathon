/*
  # Fix user deletion with CASCADE constraints

  1. Changes
    - Update users table to reference auth.users with CASCADE deletion
    - This ensures when a user is deleted from Supabase Auth, their profile is automatically removed
  
  2. Security
    - Maintains existing RLS policies
    - Ensures data consistency during user deletion
*/

-- First, drop existing foreign key constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add foreign key constraint with CASCADE deletion to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure the constraint is properly indexed for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);