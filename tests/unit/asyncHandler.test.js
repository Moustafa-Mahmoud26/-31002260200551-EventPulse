const asyncHandler = require('../../utils/asyncHandler')

describe('asyncHandler', () => {
  test('calls the wrapped function with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue('ok')
    const req = {}
    const res = {}
    const next = jest.fn()

    await asyncHandler(fn)(req, res, next)

    expect(fn).toHaveBeenCalledWith(req, res, next)
  })

  test('does not call next when the function succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('ok')
    const next = jest.fn()

    await asyncHandler(fn)({}, {}, next)

    expect(next).not.toHaveBeenCalled()
  })

  test('passes the error to next when the function throws', async () => {
    const error = new Error('boom')
    const fn = jest.fn().mockRejectedValue(error)
    const next = jest.fn()

    await asyncHandler(fn)({}, {}, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
