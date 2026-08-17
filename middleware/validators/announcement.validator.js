const { body, param } = require('express-validator')

exports.createAnnouncementValidator = [
  body('eventId').isMongoId().withMessage('A valid event id is required'),
  body('text').notEmpty().withMessage('Announcement text is required').trim()
]

exports.eventIdParamValidator = [
  param('eventId').isMongoId().withMessage('Invalid event id')
]
