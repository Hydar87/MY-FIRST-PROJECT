const crypto = require('crypto');
const jwt = require('jsonwebtoken');

//Generates a short-lived JWT Access Token (e.g., 15 minutes)
 
function generateAccessToken(user) {
  return jwt.sign(
    { 
      public_id: user.public_id, 
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

//Generates a cryptographically secure 64-character hex string (256-bit entropy).
function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

//Generates a fast SHA-256 hash of a string for secure database storage/lookup.
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken
};