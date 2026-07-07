const jwt = require('jsonwebtoken')

// Access token — short lived (15 min)
// Sent with every API request in the Authorization header
// Contains just enough info to identify the user and their role
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES } // '15m'
  )
}

// Refresh token — long lived (7 days)
// Only used to get a new access token when the old one expires
// Stored in the database against the user — so we can revoke it
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },     // minimal payload — just the id
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES } // '7d'
  )
}

module.exports = { generateAccessToken, generateRefreshToken }