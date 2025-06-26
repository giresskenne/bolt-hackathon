import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// // Google OAuth initiation
// router.get('/google', async (req, res) => {
//   try {
//     const { plan = 'free', redirect } = req.query;
    
//     // Validate redirect URL for security
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const redirectUrl = redirect || `${frontendUrl}/dashboard`;
    
//     // Ensure redirect URL is to our frontend domain for security
//     if (!redirectUrl.startsWith(frontendUrl)) {
//       return res.status(400).json({ error: 'Invalid redirect URL' });
//     }
    
//     // Add plan parameter to redirect URL if specified
//     const finalRedirectUrl = plan !== 'free' 
//       ? `${redirectUrl}?plan=${plan}` 
//       : redirectUrl;
    
//     console.log('Initiating Google OAuth with redirect:', finalRedirectUrl);
    
//     // Initiate Google OAuth with Supabase
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: finalRedirectUrl,
//         queryParams: {
//           access_type: 'offline',
//           prompt: 'consent',
//         }
//       }
//     });
    
//     if (error) {
//       console.error('Google OAuth initiation error:', error);
//       return res.status(400).json({ error: error.message });
//     }
    
//     // Redirect user to Google OAuth
//     if (data?.url) {
//       res.redirect(data.url);
//     } else {
//       res.status(500).json({ error: 'Failed to get OAuth URL' });
//     }
//   } catch (error) {
//     console.error('Google OAuth route error:', error);
//     res.status(500).json({ error: 'OAuth initiation failed' });
//   }
// });

// // Handle OAuth callback (optional - Supabase handles this automatically)
// router.get('/callback', async (req, res) => {
//   try {
//     const { code, state } = req.query;
    
//     if (!code) {
//       return res.status(400).json({ error: 'Authorization code not provided' });
//     }
    
//     // Exchange code for session
//     const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
//     if (error) {
//       console.error('OAuth callback error:', error);
//       return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
//     }
    
//     // Create or update user profile
//     if (data.user) {
//       const { error: profileError } = await supabaseAdmin
//         .from('users')
//         .upsert([
//           {
//             id: data.user.id,
//             email: data.user.email,
//             plan: 'free', // Default plan for OAuth users
//             subscription_status: 'trial',
//             trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
//             created_at: new Date().toISOString()
//           }
//         ], { 
//           onConflict: 'id',
//           ignoreDuplicates: false 
//         });
      
//       if (profileError) {
//         console.error('Profile upsert error:', profileError);
//         // Don't fail the OAuth flow for profile errors
//       }
//     }
    
//     // Redirect to frontend with success
//     const redirectUrl = state || `${process.env.FRONTEND_URL}/dashboard`;
//     res.redirect(redirectUrl);
//   } catch (error) {
//     console.error('OAuth callback error:', error);
//     res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
//   }
// });

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, plan = 'free' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          plan: plan
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Create user profile in our users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          plan: plan,
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails
    }

    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        plan: plan
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        plan: profile?.plan || 'free',
        subscription_status: profile?.subscription_status || 'trial'
      },
      session: data.session
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // Get user profile from our users table
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        plan: profile.plan,
        subscription_status: profile.subscription_status,
        stripe_customer_id: profile.stripe_customer_id,
        trial_ends_at: profile.trial_ends_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Sign out
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Signout failed' });
  }
});

// Update user profile
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, email, preferences } = req.body;

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: req.user.email,
        password: currentPassword
      });

      if (verifyError) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Update password in Supabase Auth
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        { password: newPassword }
      );

      if (updateError) {
        return res.status(400).json({ error: 'Failed to update password' });
      }
    }

    // Update user profile in our users table
    const updateData = {};
    if (email && email !== req.user.email) {
      updateData.email = email;
    }
    if (preferences) {
      updateData.preferences = preferences;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', req.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
    }

    // Get updated user profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch updated profile:', fetchError);
      return res.status(500).json({ error: 'Profile updated but failed to fetch updated data' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        email: updatedProfile.email,
        plan: updatedProfile.plan,
        subscription_status: updatedProfile.subscription_status,
        preferences: updatedProfile.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
router.post('/me/delete', authenticateUser, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    // Verify password before deletion
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: password
    });

    if (verifyError) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user from Supabase Auth first - this will trigger CASCADE deletion
    // of the user profile due to the foreign key relationship
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);

    if (authError) {
      console.error('Failed to delete user from auth:', authError);
      return res.status(500).json({ error: 'Failed to delete user account' });
    }

    // Clean up user profile from our users table if it still exists
    // (it should be automatically deleted by CASCADE, but we'll ensure it's gone)
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', req.user.id);

    // Don't fail if profile deletion fails since the auth user is already deleted
    if (profileError) {
      console.warn('Profile cleanup warning (user auth already deleted):', profileError);
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;