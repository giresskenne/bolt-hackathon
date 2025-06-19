/*
  # Create RLS policy for users table

  1. Security
    - Enable RLS on users table if not already enabled
    - Add policy to allow INSERT operations for anonymous users during signup
    - Add policy to allow users to read their own data
    - Add policy to allow users to update their own data

  This migration ensures that new users can sign up while maintaining security.
*/

-- Enable RLS on users table
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
  USING (auth.uid()::text = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);