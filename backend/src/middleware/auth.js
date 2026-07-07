const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // The frontend sends the token in the Authorization header like:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // jwt.verify throws an error if token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    // Fetch the user from DB to make sure they still exist and are active
    // decoded.id comes from the payload we set in generateAccessToken
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' })
    }

    // Attach the user to the request object
    // Every route after this middleware can access req.user
    req.user = user
    next()

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { protect }