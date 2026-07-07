const express = require('express')
const router = express.Router()
const { sendMessage, getConversation, getInbox } = require('../controllers/chatController')
const { protect } = require('../middleware/auth')

module.exports = (io) => {
  router.post('/send', protect, sendMessage(io))
  router.get('/inbox', protect, getInbox)
  router.get('/conversation/:userId', protect, getConversation)

  return router
}