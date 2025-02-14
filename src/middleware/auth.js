const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
  throw new Error('Authorization required');
};

module.exports = authMiddleware;
