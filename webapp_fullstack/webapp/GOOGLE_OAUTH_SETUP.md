# Google OAuth Setup Instructions

## Critical Configuration Required

### 1. Supabase Dashboard Configuration

**Important**: You MUST add the callback URL to your Supabase project for Google OAuth to work.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/auth/providers)
2. Navigate to Authentication > Providers > Google
3. **Add these URLs to the redirect URLs list:**
   - For production: `https://privly.app/auth/callback`
   - For local development: `http://localhost:5176/auth/callback` (adjust port as needed)

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Navigate to your OAuth 2.0 Client
3. **Add these URLs to "Authorized redirect URIs":**
   - `https://xqguzodjbfrmckrwckpx.supabase.co/auth/v1/callback`
   - This is your Supabase project's auth callback URL

### 3. Code Changes Made

✅ **Fixed OAuth Implementation:**
- Changed redirectTo from `/dashboard` to `/auth/callback`
- Created proper `AuthCallbackPage.jsx` that handles code exchange
- Added proper PKCE flow with `exchangeCodeForSession()`
- Enhanced user validation for OAuth users
- Added proper error handling

✅ **Enhanced Security:**
- Validates OAuth users have required fields (name, email, verified email)
- Signs out incomplete users automatically
- Separate login vs signup flows with different prompts
- Clear error messages guiding users to correct actions

## How It Works Now

### OAuth Flow:
1. User clicks "Sign in with Google" 
2. Redirected to Google OAuth (with prompt: 'select_account' for login, 'consent' for signup)
3. Google redirects to `/auth/callback` with authorization code
4. `AuthCallbackPage` exchanges code for session using `exchangeCodeForSession()`
5. User validation performed
6. If valid, redirected to `/dashboard`
7. If invalid, signed out with helpful error message

### Key Features:
- ✅ Proper PKCE flow implementation
- ✅ User validation and data integrity
- ✅ Error handling and user guidance
- ✅ Separate login/signup flows
- ✅ Clean URL management
- ✅ Session persistence
- ✅ Loading states and feedback

## Testing Checklist

1. **Supabase Redirect URL Added**: Verify `/auth/callback` is in your Supabase project
2. **Google Cloud Redirect URI**: Verify Supabase callback URL is in Google Cloud Console
3. **Test Login**: Existing users can sign in via Google
4. **Test Signup**: New users can sign up via Google
5. **Test Validation**: Incomplete users are properly rejected
6. **Test Navigation**: Users reach dashboard after successful auth

## Environment Variables

Your `.env` file should have:
```
VITE_SUPABASE_URL="https://xqguzodjbfrmckrwckpx.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## Debugging

If OAuth still doesn't work:

1. Check browser console for errors
2. Verify Supabase redirect URLs include `/auth/callback`
3. Verify Google Cloud Console redirect URIs include Supabase callback
4. Check Network tab for failed requests
5. Ensure environment variables are loaded correctly

The implementation now follows Supabase best practices for PKCE flow and should work correctly with proper configuration.
