const Message = require('../models/message.model')
const Event = require('../models/event.model')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId, text } = req.body

  const event = await Event.findById(eventId)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  const message = await Message.create({
    event: eventId,
    sender: req.user._id,
    text
  })

  const populated = await message.populate('sender', 'name email role')

  const io = req.app.get('io')
  if (io) {
    io.to(`event_${eventId}`).emit('announcement', populated)
  }

  res.status(201).json({ status: 'success', data: populated })
})

exports.getAnnouncementHistory = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params

  const event = await Event.findById(eventId)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  const messages = await Message.find({ event: eventId })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email role')

  res.status(200).json({ status: 'success', data: messages })
})
