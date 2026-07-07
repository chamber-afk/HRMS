const User = require('../models/User')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email }).select('+password +refreshToken')

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken
    await user.save()
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        avatar: user.avatar,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const createEmployee = async (req, res) => {
  try {
    const { name, email, role, department, managerId, salary } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    const tempPassword = 'Temp@' + Math.floor(1000 + Math.random() * 9000)

    const newUser = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || 'employee',
      department: department || null,
      managerId: managerId || null,
      salary: salary || 0,
      mustChangePassword: true,     
    })
    await sendEmail({
      to: email,
      subject: 'Welcome to HRMS — Your account is ready',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your account has been created on the HRMS platform.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p>— HR Team</p>
      `,
    })

    res.status(201).json({
      message: 'Employee created successfully. Credentials sent to email.',
      user: newUser,  
    })

  } catch (error) {
    console.error('Create employee error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}


const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select('+refreshToken')

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    // 3. Issue a new access token
    const newAccessToken = generateAccessToken(user)

    res.status(200).json({
      accessToken: newAccessToken,
    })

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
}

const logout = async (req, res) => {
  try { 
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null })

    res.status(200).json({ message: 'Logged out successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}


const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    user.mustChangePassword = false   
    await user.save()

    res.status(200).json({ message: 'Password changed successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(200).json({
        message: 'If this email exists, an OTP has been sent',
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    user.resetPasswordOTP = otp
    user.resetPasswordOTPExpiry = expiry
    await user.save()

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'HRMS — Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    })

    res.status(200).json({
      message: 'If this email exists, an OTP has been sent',
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' })
    }

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry +password')

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or email' })
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }


    if (user.resetPasswordOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    user.password = newPassword
    user.mustChangePassword = false

    user.resetPasswordOTP = null
    user.resetPasswordOTPExpiry = null

    await user.save()

    res.status(200).json({ message: 'Password reset successful. You can now log in.' })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  login,
  createEmployee,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
}