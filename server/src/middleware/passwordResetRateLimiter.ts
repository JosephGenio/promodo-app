import rateLimit from 'express-rate-limit';

// Tighter than the general authRateLimiter — these two endpoints guard a
// brute-forceable 6-digit code, so cap attempts harder than plain login.
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
