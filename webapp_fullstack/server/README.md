# Prompt-Scrubber Backend

A lightweight backend service for Prompt-Scrubber that handles user authentication via Supabase and subscription management via Stripe.

## Key Principles

- **Privacy First**: The backend never stores or reads user redaction rules
- **Lightweight**: Minimal API surface focused on auth and billing
- **Secure**: Uses Supabase Auth for user management and Stripe for payments

## Features

- User signup/signin with Supabase Auth
- Subscription management with Stripe
- Webhook handling for payment events
- JWT token validation for Chrome extension
- Rate limiting and security headers

## Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env
   # Fill in your Supabase and Stripe credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Run the migration in `supabase/migrations/001_initial_schema.sql` in your Supabase dashboard

4. **Stripe Setup**
   - Create products and prices in Stripe dashboard
   - Set up webhook endpoint pointing to `/webhook/stripe`
   - Add webhook secret to environment variables

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/signout` - Sign out user

### Subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/create-checkout` - Create Stripe checkout session
- `POST /api/subscription/create-portal` - Create billing portal session

### Webhooks
- `POST /webhook/stripe` - Handle Stripe webhook events

## Architecture

The backend is designed to be stateless and lightweight:

1. **Authentication**: Delegated to Supabase Auth
2. **User Data**: Minimal profile stored in Supabase
3. **Billing**: Handled by Stripe with webhook sync
4. **Rules Storage**: Client-side only (browser extension)

## Security

- CORS configured for frontend domain
- Rate limiting on API endpoints
- Helmet.js for security headers
- Supabase RLS policies for data access
- Stripe webhook signature verification

## Deployment

The backend can be deployed to any Node.js hosting platform:

- Vercel
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Lambda (with serverless framework)

Make sure to:
1. Set all environment variables
2. Configure Stripe webhook URL
3. Update CORS origin for production domain