const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const authRoutes = require('./routes/authRoutes') 
const employeeRoutes = require('./routes/employeeRoutes') 
const departmentRoutes = require('./routes/departmentRoutes')
const leaveRoutes = require('./routes/leaveRoutes') 
const attendanceRoutes = require('./routes/attendanceRoutes') 
const chatRoutes = require('./routes/chatRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

require('./models/User')
require('./models/Department')
require('./models/Attendance')
require('./models/Message')
require('./models/Notification')

const app = express();

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

//routes
app.use('/api/employees', employeeRoutes) 
app.use('/api/auth', authRoutes)
app.use('/api/departments', departmentRoutes)

app.use('/api/leaves', (req, res, next) => {
  const io = req.app.get('io')
  leaveRoutes(io)(req, res, next)
})

app.use('/api/attendance', (req, res, next) => {
  const io = req.app.get('io')
  attendanceRoutes(io)(req, res, next)
})

app.use('/api/chat', (req, res, next) => {
  const io = req.app.get('io')
  chatRoutes(io)(req, res, next)
})

app.use('/api/notifications', (req, res, next) => {
  const io = req.app.get('io')
  notificationRoutes(io)(req, res, next)
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HRMS server is running' })
})

module.exports = app
