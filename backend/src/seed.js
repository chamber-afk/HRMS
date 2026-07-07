require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const connectDB = require('./config/db')

const seed = async () => {
  await connectDB()

  // Check if admin already exists
  const existing = await User.findOne({ role: 'admin' })
  if (existing) {
    console.log('Admin already exists:', existing.email)
    process.exit(0)
  }

  const admin = await User.create({
    name: 'App Admin',
    email: 'admin@hrms.com',
    password: 'Admin@1234',
    role: 'admin',
    mustChangePassword: false,
  })

  console.log('Admin created:', admin.email)
  console.log('Password: Admin@1234')
  process.exit(0)
}

seed()