const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Use Railway's MONGO_URL if available, otherwise fall back to DB_STRING
    const mongoUrl = process.env.MONGO_URL || process.env.DB_STRING

    if (!mongoUrl) {
      throw new Error('No MongoDB connection string provided. Please set MONGO_URL or DB_STRING environment variable.')
    }

    const conn = await mongoose.connect(mongoUrl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: true
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('Database connection error:', err)
    process.exit(1)
  }
}

module.exports = connectDB
