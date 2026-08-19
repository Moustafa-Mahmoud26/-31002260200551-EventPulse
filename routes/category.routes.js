const express = require('express')
const { body } = require('express-validator')
const { getCategories, createCategory } = require('../controllers/category.controller')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const validate = require('../middleware/validate')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Event categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Music
 *               description:
 *                 type: string
 *                 example: Concerts and live music events
 *     responses:
 *       201:
 *         description: Category created
 *       403:
 *         description: Not authorized
 */
router
  .route('/')
  .get(getCategories)
  .post(
    requireAuth,
    requireRole('admin'),
    [body('name').notEmpty().withMessage('Category name is required').trim()],
    validate,
    createCategory
  )

module.exports = router