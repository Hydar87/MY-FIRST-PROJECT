const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const SQL = require('sql-template-strings'); // or require('../config/db')

const { hashToken, verifyAccessToken } = require("../utils/token");

const ensureAuthenticated = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

       //check if authorization header is present and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')){ return res.status(401).json({ message: 'Unauthorized' });}

    //get token from authorization header
    const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token); // Synchronous call
      // 5. Attach decoded user info and raw token to request object
      req.user = decoded;
      req.accessToken = token;
    
    const hashincomeToken = hashToken(token);
    const { rows } = await pool.query(SQL`SELECT * FROM invalid_tokens WHERE token = ${hashincomeToken}`);
    if(rows.length > 0){return res.status(401).json({ message: 'Unauthorized. invalid token' });}
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") { return res.status(401).json({ message: "Access token expired" });}
    if (error.name === "JsonWebTokenError") { return res.status(403).json({ message: "Invalid access token" }); }

    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
    ensureAuthenticated,
}
