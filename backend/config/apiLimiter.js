const rateLimit = require("express-rate-limit");

// 1. Strict Limiter for Authentication (Login, Register, Forgot Password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: "Too many login attempts. Please try again after 15 minutes." 
    });
  }
});

// 2. Moderate Limiter for Sensitive Actions (Password Change, Profile Updates)
const sensitiveActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 20,                // 20 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: "Too many requests for this action. Please slow down." 
    });
  }
});

// 3. Relaxed Limiter for General API Data (Fetching Profiles, Lists)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: "Rate limit exceeded. Please try again later." 
    });
  }
});

module.exports = {
  authLimiter,
  sensitiveActionLimiter,
  generalApiLimiter
};