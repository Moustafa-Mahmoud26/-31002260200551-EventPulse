const { body, param } = require('express-validator')

exports.createRegistrationValidator = [
  body('event').isMongoId().withMessage('A valid event id is required')
]

exports.registrationIdValidator = [
  param('id').isMongoId().withMessage('Invalid registration id')
]
