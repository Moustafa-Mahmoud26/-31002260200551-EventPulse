const express = require('express')
const { register, login } = require('../controllers/auth.controller')
const { registerValidator, loginValidator } = require('../middleware/validators/auth.validator')
const validate = require('../middleware/validate')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [attendee, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already registered
 *       422:
 *         description: Validation error
 */
router.post('/register', registerValidator, validate, register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */
router.post('/login', loginValidator, validate, login)

module.exports = router
