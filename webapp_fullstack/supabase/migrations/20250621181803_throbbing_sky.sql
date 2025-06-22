/*
  # Add user preferences column

  1. Changes
    - Add `preferences` JSONB column to `users` table to store user preferences
    - Set default empty object for existing users
    
  2. Security
    - Users can update their own preferences via RLS policies
*/

-- Add preferences column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update existing users to have empty preferences object
UPDATE users SET preferences = '{}' WHERE preferences IS NULL;