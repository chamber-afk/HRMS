//This is to check if the user has valid role to access particular information.

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      })
    }
    next()
  }
}

module.exports = { roleGuard }