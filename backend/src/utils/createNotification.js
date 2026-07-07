const Notification = require('../models/Notification')

// This utility does two things at once:
// 1. Saves notification to DB so it persists (bell history)
// 2. Emits socket event so user sees it instantly without refresh
//
// We call this from leave controller, chat controller, anywhere
// Instead of duplicating notification logic everywhere

const createNotification = async (io, { userId, message, type, refId, refModel }) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      refId: refId || null,
      refModel: refModel || null,
    })

    // Emit to the user's personal room
    // They'll receive this even if they're on a different screen
    io.to(userId.toString()).emit('notification:new', {
      notification,
    })

    return notification
  } catch (error) {
    console.error('Create notification error:', error)
  }
}

module.exports = createNotification