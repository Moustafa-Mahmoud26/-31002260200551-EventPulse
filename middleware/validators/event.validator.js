const { body, param } = require('express-validator')

exports.createEventValidator = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('category').isMongoId().withMessage('Category must be a valid MongoDB ID'),
  body('date').isISO8601().withMessage('Date must be a valid ISO8601 date'),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('venue').notEmpty().withMessage('Venue is required').trim(),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be an integer of at least 1')
]

exports.updateEventValidator = [
  param('id').isMongoId().withMessage('Invalid event id'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().notEmpty().withMessage('Description cannot be empty').trim(),
  body('category').optional().isMongoId().withMessage('Category must be a valid MongoDB ID'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date'),
  body('city').optional().notEmpty().withMessage('City cannot be empty').trim(),
  body('venue').optional().notEmpty().withMessage('Venue cannot be empty').trim(),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be an integer of at least 1')
]

exports.eventIdValidator = [param('id').isMongoId().withMessage('Invalid event id')]
