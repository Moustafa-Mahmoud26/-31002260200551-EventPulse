process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '1h'

const request = require('supertest')
const app = require('../../app')
const { connect, closeDatabase, clearDatabase } = require('../setup')
const User = require('../../models/user.model')
const Category = require('../../models/category.model')
const bcrypt = require('bcryptjs')

beforeAll(async () => {
  await connect()
})

afterEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await closeDatabase()
})

const createAdminAndToken = async () => {
  const hashed = await bcrypt.hash('Password123', 12)
  await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: hashed,
    role: 'admin'
  })

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'Password123' })

  return res.body.token
}

describe('Events API', () => {
  test('GET /api/events returns 200 and an array', async () => {
    const res = await request(app).get('/api/events')

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('success')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('POST /api/events without a token returns 401', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Test Event',
      description: 'Test description',
      date: '2026-12-01',
      city: 'Cairo',
      venue: 'Test venue',
      capacity: 10
    })

    expect(res.statusCode).toBe(401)
  })

  test('POST /api/events with invalid data returns 422', async () => {
    const token = await createAdminAndToken()

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', capacity: 0 })

    expect(res.statusCode).toBe(422)
    expect(res.body.success).toBe(false)
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  test('POST /api/events with a valid admin token creates an event', async () => {
    const token = await createAdminAndToken()
    const category = await Category.create({ name: 'Music' })

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        description: 'Test description',
        category: category._id.toString(),
        date: '2026-12-01T10:00:00.000Z',
        city: 'Cairo',
        venue: 'Test venue',
        capacity: 100
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data.title).toBe('Test Event')
  })
})
