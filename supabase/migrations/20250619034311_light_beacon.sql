/*
  # Fix existing policy conflicts

  1. Changes
    - Drop all existing policies safely using IF EXISTS
    - Recreate policies with proper structure
    - Ensure RLS is enabled

  2. Security
    - Enable RLS on users table
    - Add policy for anonymous signup
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
*/

-- Drop existing policies if they exist (safe operation)
DROP POLICY IF EXISTS "Allow anonymous signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Ensure RLS is enabled (safe to run multiple times)
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