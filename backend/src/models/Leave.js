const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Who approved or rejected — null until a decision is made
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    type: {
      type: String,
      enum: ['sick', 'casual', 'paid', 'unpaid', 'maternity', 'paternity'],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // Calculated when leave is applied — how many days requested
    totalDays: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Optional note from manager when approving or rejecting
    reviewNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave