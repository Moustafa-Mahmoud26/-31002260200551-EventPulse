process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '1h'

const request = require('supertest')
const app = require('../../app')
const { connect, closeDatabase, clearDatabase } = require('../setup')

beforeAll(async () => {
  await connect()
})

afterEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await closeDatabase()
})

describe('Auth API', () => {
  test('POST /api/auth/register creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'Password123'
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.data.email).toBe('jane@test.com')
  })

  test('POST /api/auth/register rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'Password123'
    })

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Two',
      email: 'jane@test.com',
      password: 'Password456'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('POST /api/auth/register with missing fields returns 422', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' })

    expect(res.statusCode).toBe(422)
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  test('POST /api/auth/login returns a token for correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'Password123'
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@test.com',
      password: 'Password123'
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('POST /api/auth/login rejects wrong password with no token issued', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'Password123'
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@test.com',
      password: 'WrongPassword'
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.token).toBeUndefined()
  })
})
