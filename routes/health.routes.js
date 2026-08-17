const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API and database health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database status
 */
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown'

  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    database: dbState,
    timestamp: new Date().toISOString()
  })
})

module.exports = router
