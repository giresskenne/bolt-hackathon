# Privly Frontend

A modern SaaS web application for Privly with subscription management, built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **User Authentication** - Login, signup, and profile management
- **Subscription Management** - Multiple pricing tiers with Stripe integration
- **Dashboard** - User analytics and usage tracking
- **Chrome Extension Integration** - Seamless integration with browser extension
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Updates** - State management with Zustand
- **Secure Storage** - Encrypted local storage for sensitive data

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand with persistence
- **Routing:** React Router DOM
- **UI Components:** Lucide React icons
- **Charts:** Recharts
- **Notifications:** React Hot Toast
- **Date Handling:** date-fns

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd privly.frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The app uses Vite's proxy configuration to connect to the backend. The proxy is configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'https://privlylogic.vercel.app',
    changeOrigin: true,
    secure: false,
  }
}
```

For production builds, you may need to configure environment variables or update API endpoints.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

### Development Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── ProtectedRoute.jsx  # Route protection
│   └── TextArea.jsx    # Custom textarea component
├── pages/              # Application pages
│   ├── HomePage.jsx    # Landing page
│   ├── LoginPage.jsx   # User authentication
│   ├── SignupPage.jsx  # User registration
│   ├── DashboardPage.jsx   # User dashboard
│   ├── BillingPage.jsx     # Subscription management
│   ├── UserSettingsPage.jsx   # User preferences
│   └── ...             # Other pages
├── store/              # State management
│   ├── authStore.js    # Authentication state
│   └── subscriptionStore.js    # Subscription state
├── utils/              # Utility functions
│   ├── encryptedStore.js   # Secure storage
│   ├── extensionApi.js     # Extension communication
│   ├── logger.js       # Logging utilities
│   ├── planConfig.js   # Subscription plans
│   └── quotaTracker.js     # Usage tracking
├── App.jsx             # Main app component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

## 🌐 API Integration

The application integrates with a backend API hosted on Vercel. Key endpoints include:

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/me/delete` - Delete user account

### Subscription Management
- `GET /api/subscription/status` - Get subscription details
- `POST /api/subscription/create-checkout` - Create Stripe checkout
- `POST /api/subscription/create-portal` - Create customer portal

### Analytics & Usage
- `POST /api/license/ping` - Validate license and sync usage
- `POST /api/analytics/usage` - Track usage analytics

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Encrypted Storage** - Sensitive data encryption in localStorage
- **CORS Protection** - Proper CORS configuration
- **Input Validation** - Client-side form validation
- **Secure API Communication** - HTTPS-only API calls

## 🎨 Styling and Theming

The application uses Tailwind CSS for styling with:

- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Built-in theme switching
- **Custom Components** - Reusable styled components
- **Consistent Typography** - Unified font system
- **Color Palette** - Brand-consistent colors

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set environment variables if needed
4. Deploy

### Other Platforms

The build output in `dist/` can be deployed to any static hosting service:

- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🔧 Configuration

### Vite Configuration

Key configurations in `vite.config.js`:

- **Path Aliases** - Simplified imports with `@/` prefix
- **Proxy Setup** - API routing for development
- **Build Optimization** - Production optimizations
- **Hot Reload** - Fast development experience

### Tailwind Configuration

Customize styling in `tailwind.config.js`:

- **Color Palette** - Brand colors
- **Typography** - Font families and sizes
- **Breakpoints** - Responsive design points
- **Custom Utilities** - Additional CSS utilities

## 🧪 Testing

Run tests with Vitest:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

For production deployment, you may need to configure:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
# Clear Vite cache
rm -rf .vite
npm run build
```

### API Connection Issues

If you're having trouble connecting to the API:

1. Check the proxy configuration in `vite.config.js`
2. Verify the backend is running and accessible
3. Check browser network tab for CORS errors
4. Ensure API endpoints match between frontend and backend

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

---

Built with ❤️ by the Privly team
