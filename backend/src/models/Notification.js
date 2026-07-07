const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Human readable message shown in the bell dropdown
    message: {
      type: String,
      required: true,
    },

    // Type controls the icon shown in frontend
    type: {
      type: String,
      enum: [
        'leave_applied',
        'leave_approved',
        'leave_rejected',
        'new_message',
        'announcement',
        'general',
      ],
      default: 'general',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // Optional — links notification to a specific document
    // e.g. clicking a leave notification opens that leave request
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    refModel: {
      type: String,
      enum: ['Leave', 'Message', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification