require('dotenv').config()
const app = require('../app')
const connectDB = require('../config/db')

module.exports = async (req, res) => {
  try {
    await connectDB()
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ success: false, message: 'Database connection failed' }))
    return
  }

  return app(req, res)
}