const express = require('express')
const router = express.Router()

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcast,
} = require('../controllers/notificationController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

module.exports = (io) => {
  router.get('/', protect, getMyNotifications)
  router.put('/read-all', protect, markAllAsRead)
  router.put('/:id/read', protect, markAsRead)
  router.post('/broadcast', protect, roleGuard('admin'), broadcast(io))

  return router
}