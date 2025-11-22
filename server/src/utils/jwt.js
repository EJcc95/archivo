const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate Access Token
 * @param {Object} payload 
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Generate Refresh Token
 * @returns {Object} { token, hash }
 */
const generateRefreshToken = () => {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

/**
 * Verify Access Token
 * @param {string} token 
 * @returns {Object} decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken
};
