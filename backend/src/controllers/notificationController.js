const Notification = require('../models/Notification')

// ─────────────────────────────────────────────────────────────
// GET MY NOTIFICATIONS
// Route: GET /api/notifications
// Access: All roles — own notifications only
// ─────────────────────────────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 }).limit(50) // last 50 notifications

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    })

    res.status(200).json({
      unreadCount,
      notifications,
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// MARK ONE AS READ
// Route: PUT /api/notifications/:id/read
// Access: Owner only
// ─────────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id, // ensure ownership
      },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json({ message: 'Marked as read', notification })

  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// MARK ALL AS READ
// Route: PUT /api/notifications/read-all
// Access: All roles
// ─────────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    )

    res.status(200).json({ message: 'All notifications marked as read' })

  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN BROADCAST
// Route: POST /api/notifications/broadcast
// Access: Admin only
// ─────────────────────────────────────────────────────────────
const broadcast = (io) => async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // Get all active users
    const User = require('../models/User')
    const allUsers = await User.find({ isActive: true }).select('_id')

    // Create a notification document for every user
    const notifications = allUsers.map(u => ({
      userId: u._id,
      message,
      type: 'announcement',
    }))

    await Notification.insertMany(notifications)

    // Emit to ALL connected sockets at once
    // This is different from io.to(room) — this goes to everyone
    io.emit('broadcast:announcement', {
      message,
      sentBy: req.user.name,
      sentAt: new Date(),
    })

    res.status(200).json({
      message: 'Broadcast sent to all users',
    })

  } catch (error) {
    console.error('Broadcast error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcast,
}