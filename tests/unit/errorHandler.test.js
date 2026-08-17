const errorHandler = require('../../middleware/errorHandler')
const AppError = require('../../utils/AppError')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  test('returns the correct status code and message for an AppError', () => {
    process.env.NODE_ENV = 'production'
    const err = new AppError('Event not found', 404)
    const res = mockRes()

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Event not found' })
    )
  })

  test('defaults to 500 and a generic message for non-operational errors', () => {
    process.env.NODE_ENV = 'production'
    const err = new Error('Unexpected failure')
    const res = mockRes()

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Something went wrong' })
    )
  })

  test('converts a Mongoose duplicate key error into a 409 response', () => {
    process.env.NODE_ENV = 'production'
    const err = { code: 11000, keyValue: { email: 'test@test.com' } }
    const res = mockRes()

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(409)
  })

  test('converts a Mongoose CastError into a 400 response', () => {
    process.env.NODE_ENV = 'production'
    const err = { name: 'CastError', path: '_id', value: 'bad-id' }
    const res = mockRes()

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(400)
  })
})
