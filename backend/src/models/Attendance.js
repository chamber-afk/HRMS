const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: String, // stored as "YYYY-MM-DD" string for easy daily lookup
      required: true,
    },

    clockIn: {
      type: Date,
      default: null,
    },

    clockOut: {
      type: Date,
      default: null,
    },

    // Calculated when employee clocks out — in hours
    hoursWorked: {
      type: Number,
      default: 0,
    },

    // If clock in is after 9:30 AM, marked as late
    isLate: {
      type: Boolean,
      default: false,
    },

    // Anything beyond 8 hours is overtime
    overtimeHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'on-leave'],
      default: 'present',
    },

    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Compound index — one attendance record per employee per day
// If same employee tries to clock in twice on same date, MongoDB rejects it
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model('Attendance', attendanceSchema)
module.exports = Attendance