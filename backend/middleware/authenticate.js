const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract token from 'Bearer token'

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Use async/await for JWT verification
    const decoded = await jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;  // Add the decoded user info to the request
    next();  // Proceed to the next middleware
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
