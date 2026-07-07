const Attendance = require('../models/Attendance')
const User = require('../models/User')

// Helper — get today's date as "YYYY-MM-DD" string
// We use a string for date so querying a specific day is simple
// Instead of dealing with timezone-sensitive Date range queries
const getTodayString = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Helper — calculate hours between two Date objects
const calculateHours = (clockIn, clockOut) => {
  const diff = clockOut - clockIn // milliseconds
  return parseFloat((diff / (1000 * 60 * 60)).toFixed(2)) // convert to hours
}

// ─────────────────────────────────────────────────────────────
// CLOCK IN
// Route: POST /api/attendance/clock-in
// Access: All roles
// ─────────────────────────────────────────────────────────────
const clockIn = (io) => async (req, res) => {
  try {
    const today = getTodayString()
    const now = new Date()

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employeeId: req.user._id,
      date: today,
    })

    if (existing) {
      return res.status(400).json({
        message: 'Already clocked in today',
        attendance: existing,
      })
    }

    // Late if clock in is after 9:30 AM
    // getHours() and getMinutes() use local time
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const isLate = hours > 9 || (hours === 9 && minutes > 30)

    const attendance = await Attendance.create({
      employeeId: req.user._id,
      date: today,
      clockIn: now,
      isLate,
      status: 'present',
    })

    // ── SOCKET EVENT ──────────────────────────────────────────
    // Emit to admin-hr room so they see live clock-ins on dashboard
    io.to('admin-hr').emit('attendance:clockin', {
      message: `${req.user.name} clocked in${isLate ? ' (late)' : ''}`,
      employeeId: req.user._id,
      employeeName: req.user.name,
      time: now,
      isLate,
    })

    res.status(201).json({
      message: `Clocked in successfully${isLate ? ' — you are late' : ''}`,
      attendance,
    })

  } catch (error) {
    console.error('Clock in error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// CLOCK OUT
// Route: POST /api/attendance/clock-out
// Access: All roles
// ─────────────────────────────────────────────────────────────
const clockOut = async (req, res) => {
  try {
    const today = getTodayString()
    const now = new Date()

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today,
    })

    if (!attendance) {
      return res.status(400).json({ message: 'You have not clocked in today' })
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' })
    }

    // Calculate hours worked
    const hoursWorked = calculateHours(attendance.clockIn, now)

    // Calculate overtime — anything beyond 8 hours
    const overtimeHours = hoursWorked > 8
      ? parseFloat((hoursWorked - 8).toFixed(2))
      : 0

    // Half day if less than 4 hours worked
    if (hoursWorked < 4) {
      attendance.status = 'half-day'
    }

    attendance.clockOut = now
    attendance.hoursWorked = hoursWorked
    attendance.overtimeHours = overtimeHours
    await attendance.save()

    res.status(200).json({
      message: 'Clocked out successfully',
      attendance,
      summary: {
        hoursWorked,
        overtimeHours,
        status: attendance.status,
      },
    })

  } catch (error) {
    console.error('Clock out error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET MY ATTENDANCE
// Route: GET /api/attendance/me
// Access: All roles — own records only
// ─────────────────────────────────────────────────────────────
const getMyAttendance = async (req, res) => {
  try {
    // Optional month+year filter — defaults to current month
    const { month, year } = req.query
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth()
    const targetYear = year ? parseInt(year) : new Date().getFullYear()

    // Build date range strings for the month
    // e.g. "2024-12-01" to "2024-12-31"
    const startDate = new Date(targetYear, targetMonth, 1)
      .toISOString().split('T')[0]
    const endDate = new Date(targetYear, targetMonth + 1, 0)
      .toISOString().split('T')[0]

    const records = await Attendance.find({
      employeeId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 })

    // Calculate monthly summary
    const totalPresent = records.filter(r => r.status === 'present').length
    const totalLate = records.filter(r => r.isLate).length
    const totalHours = records.reduce((sum, r) => sum + r.hoursWorked, 0)
    const totalOvertime = records.reduce((sum, r) => sum + r.overtimeHours, 0)

    res.status(200).json({
      month: targetMonth + 1,
      year: targetYear,
      summary: {
        totalPresent,
        totalLate,
        totalHours: parseFloat(totalHours.toFixed(2)),
        totalOvertime: parseFloat(totalOvertime.toFixed(2)),
      },
      records,
    })

  } catch (error) {
    console.error('Get my attendance error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET TODAY'S STATUS
// Route: GET /api/attendance/today
// Access: All roles
// ─────────────────────────────────────────────────────────────
const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayString()

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today,
    })

    // Frontend uses this to decide whether to show
    // "Clock In" or "Clock Out" button
    res.status(200).json({
      date: today,
      hasClockedIn: !!attendance,
      hasClockedOut: !!(attendance?.clockOut),
      attendance: attendance || null,
    })

  } catch (error) {
    console.error('Get today status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET TEAM ATTENDANCE (Manager)
// Route: GET /api/attendance/team
// Access: Manager, Admin, HR
// ─────────────────────────────────────────────────────────────
const getTeamAttendance = async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date || getTodayString()

    // Managers see only their team
    // Admin and HR see everyone
    let employeeIds

    if (req.user.role === 'manager') {
      const team = await User.find({
        managerId: req.user._id,
        isActive: true,
      }).select('_id')
      employeeIds = team.map(e => e._id)
    } else {
      const all = await User.find({ isActive: true }).select('_id')
      employeeIds = all.map(e => e._id)
    }

    const records = await Attendance.find({
      employeeId: { $in: employeeIds },
      date: targetDate,
    }).populate('employeeId', 'name email avatar department')

    res.status(200).json({
      date: targetDate,
      count: records.length,
      records,
    })

  } catch (error) {
    console.error('Get team attendance error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  clockIn,
  clockOut,
  getMyAttendance,
  getTodayStatus,
  getTeamAttendance,
}