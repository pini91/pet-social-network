const express = require('express')
const app = express()
// const mongoose = require('mongoose') // Not directly used, connection handled by connectDB
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo') // This is used to store the session in MongoDB
const methodOverride = require('method-override') // we need this middleware so that we are able to override the method to (PUT/DELETE)then we are able to use it down below.
const flash = require('express-flash')
const logger = require('morgan')
const connectDB = require('./config/database')
const mainRoutes = require('./routes/main')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const friendRoutes = require('./routes/friends')

// Use .env file in config folder (for local development)
// Railway provides environment variables directly, no .env file needed
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './config/.env' })
}

// Debug: Log all environment variables that start with common prefixes
console.log('=== ENVIRONMENT VARIABLES DEBUG ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? `Set (${process.env.SESSION_SECRET.length} chars)` : 'NOT SET')
console.log('DB_STRING:', process.env.DB_STRING ? 'Set' : 'NOT SET')
console.log('MONGO_URL:', process.env.MONGO_URL ? 'Set' : 'NOT SET')
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'Not in Railway')
console.log('=== END DEBUG ===')

// Early validation of critical environment variables
if (!process.env.SESSION_SECRET) {
  console.error('CRITICAL ERROR: SESSION_SECRET is not set!')
  console.error('In Railway dashboard, add: SESSION_SECRET=your-secret-key')
  process.exit(1)
}

// Passport config
require('./config/passport')(passport)

// Connect To Database
connectDB()

// Using EJS for views
app.set('view engine', 'ejs')

// Static Folder
app.use(express.static('public'))

// Body Parsing
app.use(express.urlencoded({ extended: true })) // This enables us to take all the data thats in the form and that is sent to the server.
app.use(express.json())

// Logging
app.use(logger('dev'))

// Use forms for put / delete
app.use(methodOverride('_method')) // Here we use the method Override and we are saying: use this package and look for:This query parameter "_method". So from now on, all of our post request that come in will now gonna look if they have this "_method".
// This method Override you can change it to whatever we want.

// Setup Sessions - stored in MongoDB
const mongoUrl = process.env.MONGO_URL || process.env.DB_STRING

console.log('DEBUG: Environment variables check:')
console.log('MONGO_URL:', process.env.MONGO_URL ? 'Set' : 'Not set')
console.log('DB_STRING:', process.env.DB_STRING ? 'Set' : 'Not set')
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set')
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set')
console.log('PORT:', process.env.PORT || 'Not set')
console.log('Final mongoUrl:', mongoUrl ? 'Valid' : 'Invalid/Empty')

if (!mongoUrl) {
  console.error('ERROR: No MongoDB connection string found!')
  console.error('Please set either MONGO_URL or DB_STRING environment variable')
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DB')))
  process.exit(1)
}

// Check for SESSION_SECRET
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  console.warn('WARNING: SESSION_SECRET not found! Using fallback (INSECURE)')
  console.warn('Please set SESSION_SECRET in Railway environment variables ASAP')
  console.warn('Your app will work but sessions are not secure!')
} else {
  console.log('✅ SESSION_SECRET is properly configured')
}

// Create MongoDB session store
const sessionStore = MongoStore.create({
  mongoUrl: mongoUrl.trim(), // Trim any whitespace
  touchAfter: 24 * 3600, // lazy session update
  stringify: false // Don't stringify session data
})

// Debug session store events
sessionStore.on('connected', () => {
  console.log('✅ Session store connected to MongoDB')
})

sessionStore.on('error', (error) => {
  console.error('❌ Session store error:', error)
})

app.use(
  session({
    secret: sessionSecret || 'fallback-secret-key-for-emergency',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom session name
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: 'auto', // Let Railway handle this automatically
      httpOnly: true, // Prevent XSS attacks
      sameSite: 'lax' // CSRF protection
    },
    store: sessionStore
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Use flash messages for errors, info, ect...
app.use(flash())

// Setup Routes For Which The Server Is Listening
app.use('/', mainRoutes)
app.use('/post', postRoutes)
app.use('/comment', commentRoutes)
app.use('/friends', friendRoutes)

// Server Running
const server = app.listen(process.env.PORT, () => {
  console.log('Server is running, you better catch it!')
})

// Graceful shutdown for Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated gracefully')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated gracefully')
  })
})
