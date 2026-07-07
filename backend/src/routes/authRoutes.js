const express = require('express')
const router = express.Router()

const {
  login,
  createEmployee,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

router.post('/login', login)
router.post('/refresh', refreshToken)

router.post('/logout', protect, logout)
router.post('/change-password', protect, changePassword)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.post('/create-employee', protect, roleGuard('admin', 'hr'), createEmployee)

module.exports = router