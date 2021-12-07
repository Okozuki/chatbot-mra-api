const jwt = require('jsonwebtoken');
const config = require('config');
const secret = config.get('jwtSecret');


// Middleware function is basically a function that has access to req & res objects
module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No Token, authorization denied' })
  }

  // Verify token
  try {
    await jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        res.status(401).json({ msg: 'Token is not valid' });
      }
      else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware')
    res.status(500).json({ msg: 'Server Error' });
  }
}
