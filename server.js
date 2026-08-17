require('dotenv').config()
const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 3000

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('join-event', (eventId) => {
    socket.join(`event_${eventId}`)
    console.log(`Socket ${socket.id} joined room event_${eventId}`)
  })

  socket.on('leave-event', (eventId) => {
    socket.leave(`event_${eventId}`)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

app.set('io', io)

const start = async () => {
  try {
    await connectDB()
    console.log('MongoDB connected successfully')

    server.listen(PORT, () => {
      console.log(`EventPulse API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()

module.exports = { app, server, io }
