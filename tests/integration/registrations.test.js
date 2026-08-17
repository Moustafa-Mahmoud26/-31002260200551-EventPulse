process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '1h'

const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../../app')
const { connect, closeDatabase, clearDatabase } = require('../setup')
const User = require('../../models/user.model')
const Category = require('../../models/category.model')
const Event = require('../../models/event.model')

beforeAll(async () => {
  await connect()
})

afterEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await closeDatabase()
})

const createUserAndToken = async (role = 'attendee', email = 'attendee@test.com') => {
  const hashed = await bcrypt.hash('Password123', 12)
  const user = await User.create({ name: 'Test User', email, password: hashed, role })

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password123' })

  return { token: res.body.token, user }
}

const createEvent = async (overrides = {}) => {
  const category = await Category.create({ name: 'Music' })
  const { user: organizer } = await createUserAndToken('admin', 'organizer@test.com')

  return Event.create({
    title: 'Sample Event',
    description: 'Sample description',
    category: category._id,
    date: new Date('2026-12-01'),
    city: 'Cairo',
    venue: 'Test venue',
    capacity: 1,
    organizer: organizer._id,
    ...overrides
  })
}

describe('Registrations API', () => {
  test('POST /api/registrations registers the current user for an event', async () => {
    const event = await createEvent({ capacity: 5 })
    const { token } = await createUserAndToken()

    const res = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({ event: event._id.toString() })

    expect(res.statusCode).toBe(201)
    expect(res.body.data.event).toBe(event._id.toString())
  })

  test('POST /api/registrations rejects a duplicate registration for the same user', async () => {
    const event = await createEvent({ capacity: 5 })
    const { token } = await createUserAndToken()

    await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({ event: event._id.toString() })

    const res = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({ event: event._id.toString() })

    expect(res.statusCode).toBe(400)
  })

  test('POST /api/registrations rejects registration when event is full', async () => {
    const event = await createEvent({ capacity: 1 })
    const { token: token1 } = await createUserAndToken('attendee', 'a1@test.com')
    const { token: token2 } = await createUserAndToken('attendee', 'a2@test.com')

    await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token1}`)
      .send({ event: event._id.toString() })

    const res = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token2}`)
      .send({ event: event._id.toString() })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/full/i)
  })

  test('GET /api/registrations/my returns only the current user registrations', async () => {
    const event = await createEvent({ capacity: 5 })
    const { token, user } = await createUserAndToken()

    await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({ event: event._id.toString() })

    const res = await request(app)
      .get('/api/registrations/my')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].attendee.toString()).toBe(user._id.toString())
  })

  test('DELETE /api/registrations/:id prevents cancelling someone else registration', async () => {
    const event = await createEvent({ capacity: 5 })
    const { token: ownerToken } = await createUserAndToken('attendee', 'owner@test.com')
    const { token: otherToken } = await createUserAndToken('attendee', 'other@test.com')

    const regRes = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ event: event._id.toString() })

    const res = await request(app)
      .delete(`/api/registrations/${regRes.body.data._id}`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.statusCode).toBe(403)
  })
})
