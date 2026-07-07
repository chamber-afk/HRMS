const Message = require('../models/Message')
const User = require('../models/User')
const createNotification = require('../utils/createNotification')

// ─────────────────────────────────────────────────────────────
// SEND MESSAGE
// Route: POST /api/chat/send
// Access: Employee can message their manager and vice versa
// ─────────────────────────────────────────────────────────────
const sendMessage = (io) => async (req, res) => {
  try {
    const { receiverId, content } = req.body

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' })
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId)
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: 'Receiver not found' })
    }

    // Access control — who can chat with whom:
    // Employee can only message their own manager
    // Manager can message any of their team members
    // Admin and HR can message anyone
    const sender = req.user

    if (sender.role === 'employee') {
      if (sender.managerId?.toString() !== receiverId) {
        return res.status(403).json({
          message: 'Employees can only message their assigned manager',
        })
      }
    }

    if (sender.role === 'manager') {
      const isTeamMember = await User.findOne({
        _id: receiverId,
        managerId: sender._id,
      })

      // Manager can also message admin or hr
      const isAdminOrHr = ['admin', 'hr'].includes(receiver.role)

      if (!isTeamMember && !isAdminOrHr) {
        return res.status(403).json({
          message: 'You can only message your team members',
        })
      }
    }

    // Save message to DB
    const message = await Message.create({
      senderId: sender._id,
      receiverId,
      content,
    })

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')

    // ── SOCKET EVENT ──────────────────────────────────────────
    // Emit to receiver's personal room
    // They get the message instantly — this is the core of real time chat
    io.to(receiverId.toString()).emit('chat:message', {
      message: populatedMessage,
    })

    // Also emit back to sender's room so if they have
    // multiple devices or tabs open, all stay in sync
    io.to(sender._id.toString()).emit('chat:message', {
      message: populatedMessage,
    })

    // Create a notification for the receiver
    await createNotification(io, {
      userId: receiverId,
      message: `New message from ${sender.name}`,
      type: 'new_message',
      refId: message._id,
      refModel: 'Message',
    })

    res.status(201).json({
      message: 'Message sent',
      data: populatedMessage,
    })

  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET CONVERSATION
// Route: GET /api/chat/conversation/:userId
// Access: Participants of the conversation only
// ─────────────────────────────────────────────────────────────

// This fetches all messages between the logged in user
// and the user specified in :userId — in both directions
// so we query where (sender=me AND receiver=them) OR (sender=them AND receiver=me)

const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId
    const myId = req.user._id

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    })
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')
      .sort({ createdAt: 1 }) // oldest first for chat display

    // Mark all unread messages from the other user as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: myId,
        isRead: false,
      },
      { isRead: true }
    )

    res.status(200).json({
      count: messages.length,
      messages,
    })

  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET MY CONVERSATIONS (inbox — list of people I've chatted with)
// Route: GET /api/chat/inbox
// Access: All roles
// ─────────────────────────────────────────────────────────────
const getInbox = async (req, res) => {
  try {
    const myId = req.user._id

    // Find all messages where I am sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')
      .sort({ createdAt: -1 })

    // Build a unique list of conversations
    // One entry per person I've chatted with
    // Shows the latest message and unread count
    const conversationMap = {}

    for (const msg of messages) {
      const otherId =
        msg.senderId._id.toString() === myId.toString()
          ? msg.receiverId._id.toString()
          : msg.senderId._id.toString()

      if (!conversationMap[otherId]) {
        const otherUser =
          msg.senderId._id.toString() === myId.toString()
            ? msg.receiverId
            : msg.senderId

        conversationMap[otherId] = {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        }
      }

      // Count unread messages from this person
      if (
        msg.receiverId._id.toString() === myId.toString() &&
        !msg.isRead
      ) {
        conversationMap[otherId].unreadCount++
      }
    }

    const inbox = Object.values(conversationMap)

    res.status(200).json({
      count: inbox.length,
      inbox,
    })

  } catch (error) {
    console.error('Get inbox error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { sendMessage, getConversation, getInbox }