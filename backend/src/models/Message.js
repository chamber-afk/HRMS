const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for fast conversation queries
// When fetching chat between two users we query by both IDs
messageSchema.index({ senderId: 1, receiverId: 1 })

const Message = mongoose.model('Message', messageSchema)
module.exports = Message