require('dotenv').config()
const http = require('http')
const app = require('./src/app')
const connectDB = require('./src/config/db')
const { initSocket } = require('./src/socket/index')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const httpServer = http.createServer(app)

  const io = initSocket(httpServer)
  app.set('io', io)

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()