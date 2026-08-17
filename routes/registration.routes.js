const express = require('express')
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration
} = require('../controllers/registration.controller')
const requireAuth = require('../middleware/requireAuth')
const validate = require('../middleware/validate')
const {
  createRegistrationValidator,
  registrationIdValidator
} = require('../middleware/validators/registration.validator')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Event registration and capacity management
 */

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Register the current user for an event
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event]
 *             properties:
 *               event:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration created
 *       400:
 *         description: Already registered or event is full
 *       404:
 *         description: Event not found
 */
router.post('/', requireAuth, createRegistrationValidator, validate, registerForEvent)

/**
 * @swagger
 * /api/registrations/my:
 *   get:
 *     summary: Get the current user's registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registrations with event details
 */
router.get('/my', requireAuth, getMyRegistrations)

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel the current user's registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registration cancelled
 *       403:
 *         description: Not your registration
 *       404:
 *         description: Registration not found
 */
router.delete('/:id', requireAuth, registrationIdValidator, validate, cancelRegistration)

module.exports = router
