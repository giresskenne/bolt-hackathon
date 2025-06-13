import rateLimit from 'express-rate-limit';

// Store for tracking IP addresses with suspicious activity
const suspiciousIPs = new Map();

// Helper to check if IP is suspicious (multiple failed attempts)
const isSuspiciousIP = (ip) => {
    const attempts = suspiciousIPs.get(ip);
    return attempts && attempts.count >= 10;
};

// Record failed login attempt
export const recordFailedAttempt = (ip) => {
    const now = Date.now();
    const attempt = suspiciousIPs.get(ip) || { count: 0, firstAttempt: now };
    attempt.count++;
    attempt.lastAttempt = now;
    suspiciousIPs.set(ip, attempt);

    // Reset after 24 hours
    setTimeout(() => {
        suspiciousIPs.delete(ip);
    }, 24 * 60 * 60 * 1000);
};

// Global rate limiter - 1000 requests per IP per 15 minutes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/webhooks'), // Skip webhooks
});

// Auth routes limiter - stricter limits for suspicious IPs
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
        return isSuspiciousIP(req.ip) ? 2 : 5; // Stricter limit for suspicious IPs
    },
    message: (req) => {
        const timeWindow = isSuspiciousIP(req.ip) ? '1 hour' : '15 minutes';
        return `Too many authentication attempts, please try again after ${timeWindow}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
    handler: (req, res) => {
        recordFailedAttempt(req.ip);
        res.status(429).json({
            error: 'Too many authentication attempts',
            nextTry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        });
    }
});

// API routes limiter - 100 requests per minute per IP, 300 if authenticated
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
        return req.user ? 300 : 100; // Higher limit for authenticated users
    },
    message: 'Too many API requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/webhooks'), // Skip webhooks
    handler: (req, res) => {
        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: new Date(Date.now() + 60 * 1000).toISOString()
        });
    }
});

// License ping limiter - 1 request per minute per license
export const licensePingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: 'License ping rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip, // Rate limit by user ID if authenticated, otherwise IP
    handler: (req, res) => {
        res.status(429).json({
            error: 'License ping rate limit exceeded',
            retryAfter: new Date(Date.now() + 60 * 1000).toISOString()
        });
    }
});
