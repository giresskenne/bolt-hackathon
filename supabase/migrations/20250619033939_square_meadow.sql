/*
  # Fix existing RLS policies

  This migration handles the case where policies might already exist from previous migration attempts.
  
  1. Security
    - Drop existing policies if they exist
    - Recreate policies with correct syntax
    - Enable RLS on users table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Enable RLS on users table (safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new records (for signup)
CREATE POLICY "Allow anonymous signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);