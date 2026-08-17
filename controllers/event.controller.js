const Event = require('../models/event.model')
const Category = require('../models/category.model')
const Registration = require('../models/registration.model')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const SORTABLE_FIELDS = ['date', 'registrations', 'createdAt']

exports.getEvents = asyncHandler(async (req, res, next) => {
  const { category, city, startDate, endDate, search, sortBy, order, page = 1, limit = 10 } = req.query

  const filter = {}

  if (category) filter.category = category
  if (city) filter.city = new RegExp(`^${city}$`, 'i')

  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate)
  }

  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ]
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1)
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1)
  const skip = (pageNum - 1) * limitNum

  let query = Event.find(filter).populate('category', 'name description').populate('organizer', 'name email role')

  const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'desc' ? -1 : 1

  if (sortField === 'registrations') {
    const events = await Event.find(filter)
      .populate('category', 'name description')
      .populate('organizer', 'name email role')
      .lean()

    const counts = await Registration.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ])
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]))

    events.forEach((e) => {
      e.registrationsCount = countMap.get(String(e._id)) || 0
    })

    events.sort((a, b) => (sortOrder === 1 ? a.registrationsCount - b.registrationsCount : b.registrationsCount - a.registrationsCount))

    const total = events.length
    const paginated = events.slice(skip, skip + limitNum)

    return res.status(200).json({
      status: 'success',
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: paginated
    })
  }

  const total = await Event.countDocuments(filter)
  const events = await query
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    data: events
  })
})

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('category', 'name description')
    .populate('organizer', 'name email role')

  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  res.status(200).json({ status: 'success', data: event })
})

exports.createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, category, date, city, venue, capacity } = req.body

  const categoryExists = await Category.findById(category)
  if (!categoryExists) {
    return next(new AppError('Category not found', 404))
  }

  const event = await Event.create({
    title,
    description,
    category,
    date,
    city,
    venue,
    capacity,
    organizer: req.user._id
  })

  res.status(201).json({ status: 'success', data: event })
})

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  const allowedFields = ['title', 'description', 'category', 'date', 'city', 'venue', 'capacity']
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field]
    }
  })

  await event.save()

  res.status(200).json({ status: 'success', data: event })
})

exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  await event.deleteOne()

  res.status(200).json({ status: 'success', data: null })
})

exports.getEventStatus = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    return next(new AppError('Event not found', 404))
  }

  const registeredCount = await Registration.countDocuments({ event: event._id })

  res.status(200).json({
    status: 'success',
    data: {
      capacity: event.capacity,
      registered: registeredCount,
      seatsLeft: Math.max(event.capacity - registeredCount, 0),
      isFull: registeredCount >= event.capacity
    }
  })
})
