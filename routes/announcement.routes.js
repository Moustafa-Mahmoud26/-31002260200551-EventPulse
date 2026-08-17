const express = require('express')
const {
  createAnnouncement,
  getAnnouncementHistory
} = require('../controllers/announcement.controller')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const validate = require('../middleware/validate')
const {
  createAnnouncementValidator,
  eventIdParamValidator
} = require('../middleware/validators/announcement.validator')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Real-time announcements for events via Socket.io
 */

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Send a real-time announcement to an event room (admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, text]
 *             properties:
 *               eventId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement sent and saved
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 */
router.post('/', requireAuth, requireRole('admin'), createAnnouncementValidator, validate, createAnnouncement)

/**
 * @swagger
 * /api/announcements/{eventId}:
 *   get:
 *     summary: Get announcement history for a specific event
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of past announcements, newest first
 *       404:
 *         description: Event not found
 */
router.get('/:eventId', eventIdParamValidator, validate, getAnnouncementHistory)

module.exports = router
