const Category = require('../models/category.model')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find()
  res.status(200).json({ status: 'success', data: categories })
})

exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body
  const category = await Category.create({ name, description })
  res.status(201).json({ status: 'success', data: category })
})
