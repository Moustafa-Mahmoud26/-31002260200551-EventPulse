const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables')
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose.connection
}

module.exports = connectDB