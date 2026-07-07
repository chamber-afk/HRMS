const express = require('express')
const router = express.Router()

const {
  applyLeave,
  reviewLeave,
  getAllLeaves,
  getLeaveById,
  cancelLeave,
} = require('../controllers/leaveController')

const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

module.exports = (io) => {
  router.get('/', protect, getAllLeaves)
  router.get('/:id', protect, getLeaveById)
  router.post('/', protect, applyLeave(io))
  router.put('/:id/review', protect, roleGuard('admin', 'hr', 'manager'), reviewLeave(io))
  router.delete('/:id', protect, cancelLeave)

  return router
}