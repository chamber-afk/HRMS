// Run this with: node src/testSocket.js
// This simulates three users connecting via socket
// and shows you events firing in real time

const { io: socketClient } = require('socket.io-client')

// ── PASTE YOUR TOKENS HERE ────────────────────────────────────
const RAHUL_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjJkNGI3OWI2MzNhYTUxY2NhNjA0MSIsImVtYWlsIjoicmFodWxAaHJtcy5jb20iLCJyb2xlIjoiZW1wbG95ZWUiLCJpYXQiOjE3ODEwODcyNzEsImV4cCI6MTc4MTA4ODE3MX0.Ub6CcVxVKKU1VZ2UKX5oYXqEHH7gwBAsG71ivZ8Dp00'
const ARJUN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjkyYmI2M2U1OWQzMjAwNzRhMThmNiIsImVtYWlsIjoiYXJqdW5AaHJtcy5jb20iLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTc4MTA4NzIwNywiZXhwIjoxNzgxMDg4MTA3fQ.JLS0-ZoPnhku8JNrojVUdGoiFzANDDhVfIpj7OsDm2A'
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjJkMTNmMjc2MDc1MDQyNWQ0MTZlYyIsImVtYWlsIjoiYWRtaW5AaHJtcy5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODEwODcyMjcsImV4cCI6MTc4MTA4ODEyN30.Gg3GbL-D2hDJ3RDowxEUjW4MNmI3Evrly7b6F9JFV8s'
// ─────────────────────────────────────────────────────────────

const SERVER_URL = 'http://localhost:5001'

// Connect as Rahul
const rahulSocket = socketClient(SERVER_URL, {
  auth: { token: RAHUL_TOKEN },
  transports: ['websocket'],
})

// Connect as Arjun
const arjunSocket = socketClient(SERVER_URL, {
  auth: { token: ARJUN_TOKEN },
  transports: ['websocket'],
})

// Connect as Admin
const adminSocket = socketClient(SERVER_URL, {
  auth: { token: ADMIN_TOKEN },
  transports: ['websocket'],
})

// ── RAHUL'S LISTENERS ─────────────────────────────────────────
rahulSocket.on('connect', () => {
  console.log('\n✅ Rahul connected — socket id:', rahulSocket.id)
})

rahulSocket.on('chat:message', (data) => {
  console.log('\n💬 [RAHUL received chat:message]')
  console.log('   From:', data.message.senderId.name)
  console.log('   Content:', data.message.content)
})

rahulSocket.on('notification:new', (data) => {
  console.log('\n🔔 [RAHUL received notification:new]')
  console.log('   Message:', data.notification.message)
  console.log('   Type:', data.notification.type)
})

rahulSocket.on('leave:decision', (data) => {
  console.log('\n📋 [RAHUL received leave:decision]')
  console.log('   Message:', data.message)
  console.log('   Status:', data.leave.status)
})

rahulSocket.on('broadcast:announcement', (data) => {
  console.log('\n📢 [RAHUL received broadcast]')
  console.log('   Message:', data.message)
})

rahulSocket.on('connect_error', (err) => {
  console.log('\n❌ Rahul connection error:', err.message)
})

// ── ARJUN'S LISTENERS ─────────────────────────────────────────
arjunSocket.on('connect', () => {
  console.log('\n✅ Arjun connected — socket id:', arjunSocket.id)
})

arjunSocket.on('chat:message', (data) => {
  console.log('\n💬 [ARJUN received chat:message]')
  console.log('   From:', data.message.senderId.name)
  console.log('   Content:', data.message.content)
})

arjunSocket.on('notification:new', (data) => {
  console.log('\n🔔 [ARJUN received notification:new]')
  console.log('   Message:', data.notification.message)
  console.log('   Type:', data.notification.type)
})

arjunSocket.on('leave:new', (data) => {
  console.log('\n📋 [ARJUN received leave:new]')
  console.log('   Message:', data.message)
  console.log('   Leave type:', data.leave.type)
  console.log('   Total days:', data.leave.totalDays)
})

arjunSocket.on('broadcast:announcement', (data) => {
  console.log('\n📢 [ARJUN received broadcast]')
  console.log('   Message:', data.message)
})

arjunSocket.on('connect_error', (err) => {
  console.log('\n❌ Arjun connection error:', err.message)
})

// ── ADMIN'S LISTENERS ─────────────────────────────────────────
adminSocket.on('connect', () => {
  console.log('\n✅ Admin connected — socket id:', adminSocket.id)
})

adminSocket.on('attendance:clockin', (data) => {
  console.log('\n⏰ [ADMIN received attendance:clockin]')
  console.log('   Employee:', data.employeeName)
  console.log('   Late:', data.isLate)
})

adminSocket.on('broadcast:announcement', (data) => {
  console.log('\n📢 [ADMIN received broadcast]')
  console.log('   Message:', data.message)
})

adminSocket.on('leave:new', (data) => {
  console.log('\n📋 [ADMIN received leave:new]')
  console.log('   Message:', data.message)
})

adminSocket.on('connect_error', (err) => {
  console.log('\n❌ Admin connection error:', err.message)
})

console.log('\n⏳ Connecting all three users to socket server...')
console.log('   Once connected, fire HTTP requests in Postman and watch events here\n')