const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let io

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication error — no token'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      socket.user = decoded 
      next()
    } catch (err) {
      return next(new Error('Authentication error — invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.email} (${socket.user.role})`)

    socket.join(socket.user.id)
    console.log(`${socket.user.email} joined personal room: ${socket.user.id}`)

    if (['admin', 'hr'].includes(socket.user.role)) {
      socket.join('admin-hr')
      console.log(`${socket.user.email} joined admin-hr room`)
    }

    socket.broadcast.emit('user:online', {
      userId: socket.user.id,
      name: socket.user.email,
      role: socket.user.role,
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.email}`)

      socket.broadcast.emit('user:offline', {
        userId: socket.user.id,
      })
    })
  })

  return io
}

const getIO = () => {
  if (!io) throw new Error('Socket not initialized')
  return io
}

module.exports = { initSocket, getIO }


