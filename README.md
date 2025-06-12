# Prompt-Scrubber SaaS

A complete SaaS application for Prompt-Scrubber with Freemium subscriptions, client-side encryption, and license management.

## 🚀 Features

### Frontend Web Application
- **Authentication**: Secure signup/login with JWT tokens
- **Dashboard**: Usage tracking, custom rules management, plan overview
- **Billing**: Stripe integration for subscription management
- **Documentation**: Developer guides and API reference
- **Legal Pages**: Privacy policy, terms of service, cookie policy

### Backend Services
- **License Validation**: Lightweight license ping system
- **Subscription Management**: Stripe webhook handling
- **Usage Tracking**: Plan enforcement and quota management
- **Security**: JWT authentication, encrypted data storage

### Client-Side Utilities
- **EncryptedStore**: AES-256-GCM encryption for local data
- **QuotaTracker**: Usage monitoring and license ping management
- **Plan Enforcement**: Client and server-side quota validation

## 📋 Subscription Plans

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Scrub actions/month | 800 | Unlimited | Unlimited |
| Custom rules | 25 | 100 | Unlimited |
| Built-in patterns | 20 | 100+ | All features |
| History retention | 24h | 90d | Custom |
| Support | Community | Priority | Dedicated CSM |
| Price | $0 | $7/mo | Contact sales |

## 🛠 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stripe account for payments

### Environment Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd prompt-scrubber-saas
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up Stripe:**
   - Create products and prices in Stripe Dashboard
   - Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Add webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### Development

**Start the development servers:**

```bash
# Frontend (React app)
npm run dev

# Backend (Express server)
npm run start:server
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

### Production Deployment

**Build the application:**
```bash
npm run build
```

**Deploy to your preferred platform:**
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Railway, Render, AWS, or any Node.js hosting

## 🔧 Configuration

### Required Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
```

### Stripe Setup

1. **Create Products:**
   - Pro Plan: $7/month or $79/year
   - Enterprise: Custom pricing

2. **Configure Webhooks:**
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: All subscription and payment events

3. **Test Mode:**
   - Use test keys for development
   - Use live keys for production

## 🧪 Testing

**Run the test suite:**
```bash
npm test
```

**Run specific tests:**
```bash
npm test -- encryptedStore.test.js
npm test -- quotaTracker.test.js
```

**Test coverage:**
```bash
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

### License & Subscription

```bash
POST /api/license/ping
POST /api/subscription/upgrade
POST /api/subscription/portal
```

### Webhooks

```bash
POST /api/webhooks/stripe
```

## 🔐 Security Features

### Client-Side Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: IndexedDB with localStorage fallback

### Data Protection
- All sensitive data processed locally
- Zero-knowledge architecture
- Encrypted storage for custom rules and history

### Authentication
- JWT tokens with 30-day expiration
- Secure password hashing with bcrypt
- Rate limiting and CORS protection

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── store/              # Zustand state management
├── utils/              # Client-side utilities
└── App.jsx             # Main application component
```

### Backend Structure
```
server/
├── index.js            # Express server and routes
├── middleware/         # Authentication and validation
└── utils/              # Server utilities
```

### Utilities
```
src/utils/
├── encryptedStore.js   # Client-side encryption
└── quotaTracker.js     # Usage tracking and license ping
```

## 🔄 License Ping System

The license ping validates subscription status without transmitting sensitive data:

**Request Format:**
```json
{
  "userId": "user_123",
  "plan": "pro", 
  "scrubCountThisMonth": 1250,
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

**Response Format:**
```json
{
  "valid": true,
  "plan": "pro",
  "limits": {
    "scrubsPerMonth": -1,
    "customRules": 100,
    "patterns": 100
  },
  "renewalDate": "2025-02-01T00:00:00Z"
}
```

## 📊 Usage Tracking

### Client-Side Quota Management
- Real-time usage tracking
- Plan limit enforcement
- Automatic license ping triggers

### Server-Side Validation
- Subscription status verification
- Usage analytics (anonymized)
- Plan upgrade/downgrade handling

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Configure production environment variables
- [ ] Set up Stripe products and webhooks
- [ ] Test payment flows in Stripe test mode
- [ ] Run full test suite
- [ ] Build production assets

### Post-Deployment
- [ ] Verify webhook endpoints
- [ ] Test subscription flows
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the `/docs` page in the application
- **Issues**: Create an issue in the repository
- **Enterprise**: Contact enterprise@prompt-scrubber.com

---

**Built with ❤️ for privacy and security**