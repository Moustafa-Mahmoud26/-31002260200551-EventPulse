const AppError = require('../utils/AppError')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {}).join(', ')
  const message = `Duplicate value for field: ${field}. Please use another value`
  return new AppError(message, 409)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid input data: ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token. Please log in again', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again', 401)

const sendErrorResponse = (err, res) => {
  const statusCode = err.statusCode || 500
  const payload = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong'
  }

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack
    payload.error = err
  }

  res.status(statusCode).json(payload)
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err)
  error.message = err.message

  if (error.name === 'CastError') error = handleCastErrorDB(error)
  if (error.code === 11000) error = handleDuplicateFieldsDB(error)
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
  if (error.name === 'JsonWebTokenError') error = handleJWTError()
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()

  if (!(error instanceof AppError)) {
    error.isOperational = error.isOperational || false
  }

  sendErrorResponse(error, res)
}

module.exports = errorHandler
