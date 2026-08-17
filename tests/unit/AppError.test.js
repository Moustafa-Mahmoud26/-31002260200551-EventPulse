const AppError = require('../../utils/AppError')

describe('AppError', () => {
  test('creates an operational error with correct status for 404', () => {
    const err = new AppError('Not found', 404)
    expect(err.message).toBe('Not found')
    expect(err.statusCode).toBe(404)
    expect(err.status).toBe('fail')
    expect(err.isOperational).toBe(true)
  })

  test('creates an operational error with correct status for 500', () => {
    const err = new AppError('Server error', 500)
    expect(err.statusCode).toBe(500)
    expect(err.status).toBe('error')
    expect(err.isOperational).toBe(true)
  })

  test('is an instance of Error and AppError', () => {
    const err = new AppError('Something failed', 400)
    expect(err instanceof Error).toBe(true)
    expect(err instanceof AppError).toBe(true)
  })
})
