require('dotenv').config()
const bcrypt = require('bcryptjs')
const connectDB = require('./config/db')
const User = require('./models/user.model')
const Category = require('./models/category.model')
const Event = require('./models/event.model')
const Registration = require('./models/registration.model')
const Message = require('./models/message.model')

const seed = async () => {
  try {
    await connectDB()
    console.log('Connected to database for seeding')

    await Message.deleteMany()
    await Registration.deleteMany()
    await Event.deleteMany()
    await Category.deleteMany()
    await User.deleteMany()

    console.log('Old data cleared')

    const hashedPassword = await bcrypt.hash('Admin@123', 12)
    const admin = await User.create({
      name: 'EventPulse Admin',
      email: 'admin@eventpulse.com',
      password: hashedPassword,
      role: 'admin'
    })

    const attendeePassword = await bcrypt.hash('Attendee@123', 12)
    const attendee = await User.create({
      name: 'Sample Attendee',
      email: 'attendee@eventpulse.com',
      password: attendeePassword,
      role: 'attendee'
    })

    console.log('Users created')

    const categories = await Category.insertMany([
      { name: 'Music', description: 'Concerts, festivals and live music events' },
      { name: 'Tech', description: 'Conferences, hackathons and workshops' },
      { name: 'Sports', description: 'Tournaments, matches and sporting events' }
    ])

    console.log('Categories created')

    const events = await Event.insertMany([
      {
        title: 'Cairo Jazz Night',
        description: 'An evening of smooth jazz featuring local and international artists',
        category: categories[0]._id,
        date: new Date('2026-09-15T19:00:00Z'),
        city: 'Cairo',
        venue: 'Cairo Opera House',
        capacity: 150,
        organizer: admin._id
      },
      {
        title: 'Tech Conference 2026',
        description: 'A gathering of developers, founders and tech enthusiasts',
        category: categories[1]._id,
        date: new Date('2026-10-05T09:00:00Z'),
        city: 'Cairo',
        venue: 'Cairo Convention Center',
        capacity: 300,
        organizer: admin._id
      },
      {
        title: 'Alexandria Football Cup',
        description: 'Amateur football tournament open to all ages',
        category: categories[2]._id,
        date: new Date('2026-11-01T10:00:00Z'),
        city: 'Alexandria',
        venue: 'Borg El Arab Stadium',
        capacity: 500,
        organizer: admin._id
      },
      {
        title: 'Rock the Nile Festival',
        description: 'Outdoor rock music festival on the banks of the Nile',
        category: categories[0]._id,
        date: new Date('2026-09-28T18:00:00Z'),
        city: 'Luxor',
        venue: 'Nile Corniche',
        capacity: 800,
        organizer: admin._id
      }
    ])

    console.log('Events created')

    await Registration.create({
      event: events[0]._id,
      attendee: attendee._id
    })

    console.log('Sample registration created')
    console.log('Seeding completed successfully')
    console.log('Admin login: admin@eventpulse.com / Admin@123')
    console.log('Attendee login: attendee@eventpulse.com / Attendee@123')

    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
