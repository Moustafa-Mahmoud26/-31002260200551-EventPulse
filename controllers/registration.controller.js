const Registration = require('../models/registration.model')
const Event = require('../models/event.model')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { event: eventId } = req.body

  const event = await Event.findById(eventId)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  const alreadyRegistered = await Registration.findOne({
    event: eventId,
    attendee: req.user._id
  })
  if (alreadyRegistered) {
    return next(new AppError('You are already registered for this event', 400))
  }

  const currentCount = await Registration.countDocuments({ event: eventId })
  if (currentCount >= event.capacity) {
    return next(new AppError('This event is full', 400))
  }

  const registration = await Registration.create({
    event: eventId,
    attendee: req.user._id
  })

  res.status(201).json({ status: 'success', data: registration })
})

exports.getMyRegistrations = asyncHandler(async (req, res, next) => {
  const registrations = await Registration.find({ attendee: req.user._id }).populate({
    path: 'event',
    select: 'title date city venue capacity',
    populate: { path: 'category', select: 'name' }
  })

  res.status(200).json({ status: 'success', data: registrations })
})

exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
  if (!registration) {
    return next(new AppError('Registration not found', 404))
  }

  if (String(registration.attendee) !== String(req.user._id)) {
    return next(new AppError('You are not allowed to cancel this registration', 403))
  }

  await registration.deleteOne()

  res.status(200).json({ status: 'success', data: null })
})
