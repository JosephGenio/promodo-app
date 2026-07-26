import rateLimit from 'express-rate-limit';

// Applied to all /api/auth/* routes to blunt credential-stuffing / brute force.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
