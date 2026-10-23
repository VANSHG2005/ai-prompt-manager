const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'ai-prompt-manager-secret-fallback-key';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || `${getJwtSecret()}_refresh`;

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getRefreshSecret());
  } catch (err) {
    // Fallback: verify against JWT_SECRET for backward compatibility
    return jwt.verify(token, getJwtSecret());
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  getJwtSecret,
  getRefreshSecret,
};
