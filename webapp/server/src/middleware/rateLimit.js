const createRateLimiter = (key, getLimit = () => 10, windowMs = 15 * 1000) => {
  const limiter = new Map();

  return async (req, res, next) => {
    // Skip rate limiting in test environment unless explicitly testing it
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const currentTime = Date.now();
    const userKey = `${ip}-${req.path}`;
    
    // Initialize or get user's request history
    const userHistory = limiter.get(userKey) || [];
    
    // Clean old requests outside the window
    const validHistory = userHistory.filter(time => currentTime - time < windowMs);
    
    // Determine limit based on auth status
    const limit = typeof getLimit === 'function' ? 
      getLimit(req) : 
      (req.user ? 100 : getLimit);
    
    if (validHistory.length >= limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.'
      });
    }
    
    // Add current request timestamp
    validHistory.push(currentTime);
    limiter.set(userKey, validHistory);

    // For tests, also store in test state
    if (process.env.NODE_ENV === 'test' && global.__TEST_STATE__) {
      const testLimiter = global.__TEST_STATE__.rateLimiters[key];
      testLimiter.set(userKey, validHistory);
    }
    
    next();
  };
};

// Rate limiters with proper limits
export const authRateLimit = createRateLimiter('auth', 5); // 5 requests per 15 seconds
export const apiRateLimit = createRateLimiter('api', (req) => req.user ? 100 : 10); // Different limits for auth/unauth
export const licenseRateLimit = createRateLimiter('license', 3, 5 * 1000); // 3 requests per 5 seconds