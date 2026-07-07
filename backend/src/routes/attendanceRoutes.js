const express = require('express')
const router = express.Router()

const {
  clockIn,
  clockOut,
  getMyAttendance,
  getTodayStatus,
  getTeamAttendance,
} = require('../controllers/attendanceController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

module.exports = (io) => {
  router.post('/clock-in', protect, clockIn(io))
  router.post('/clock-out', protect, clockOut)
  router.get('/today', protect, getTodayStatus)
  router.get('/me', protect, getMyAttendance)
  router.get('/team', protect, roleGuard('admin', 'hr', 'manager'), getTeamAttendance)

  return router
}