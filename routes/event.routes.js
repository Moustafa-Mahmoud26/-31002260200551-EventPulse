const express = require('express')
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStatus
} = require('../controllers/event.controller')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const validate = require('../middleware/validate')
const {
  createEventValidator,
  updateEventValidator,
  eventIdValidator
} = require('../middleware/validators/event.validator')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management with filtering, search, sorting and pagination
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filtering, search, sorting and pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [date, registrations, createdAt] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     summary: Create a new event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Event created
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       422:
 *         description: Validation error
 */
router
  .route('/')
  .get(getEvents)
  .post(requireAuth, requireRole('admin'), createEventValidator, validate, createEvent)

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *   patch:
 *     summary: Update an event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 */
router
  .route('/:id')
  .get(eventIdValidator, validate, getEvent)
  .patch(requireAuth, requireRole('admin'), updateEventValidator, validate, updateEvent)
  .delete(requireAuth, requireRole('admin'), eventIdValidator, validate, deleteEvent)

/**
 * @swagger
 * /api/events/{id}/status:
 *   get:
 *     summary: Get seats left / capacity info for an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event capacity status
 *       404:
 *         description: Event not found
 */
router.get('/:id/status', eventIdValidator, validate, getEventStatus)

module.exports = router
