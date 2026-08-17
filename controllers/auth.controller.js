const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError('Email is already registered', 400))
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'attendee'
  })

  const token = signToken(user._id, user.role)

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new AppError('Invalid email or password', 401))
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401))
  }

  const token = signToken(user._id, user.role)

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})
