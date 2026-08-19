const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const swaggerSpec = require('./config/swagger')

const authRoutes = require('./routes/auth.routes')
const eventRoutes = require('./routes/event.routes')
const registrationRoutes = require('./routes/registration.routes')
const announcementRoutes = require('./routes/announcement.routes')
const categoryRoutes = require('./routes/category.routes')
const healthRoutes = require('./routes/health.routes')
const AppError = require('./utils/AppError')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())
app.use(mongoSanitize())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

const apiDocsHtml = fs.readFileSync(path.join(__dirname, 'public', 'api-docs.html'), 'utf-8')

app.get('/api-docs/swagger.json', (req, res) => {
  res.status(200).json(swaggerSpec)
})

app.get('/api-docs', (req, res) => {
  res.status(200).send(apiDocsHtml)
})

app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/registrations', registrationRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the EventPulse API',
    docs: '/api-docs',
    health: '/health'
  })
})

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
})

app.use(errorHandler)

module.exports = app