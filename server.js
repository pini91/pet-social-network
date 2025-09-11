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
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'NOT SET')
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'NOT SET')
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'NOT SET')
console.log('CLOUD_NAME (legacy):', process.env.CLOUD_NAME ? 'Set' : 'NOT SET')
console.log('API_KEY (legacy):', process.env.API_KEY ? 'Set' : 'NOT SET')
console.log('API_SECRET (legacy):', process.env.API_SECRET ? 'Set' : 'NOT SET')
console.log('EMAIL_HOST:', process.env.EMAIL_HOST ? 'Set' : 'NOT SET')
console.log('EMAIL_PORT:', process.env.EMAIL_PORT ? 'Set' : 'NOT SET')
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET')
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET')
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'NOT SET')
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'Not in Railway')
console.log('=== END DEBUG ===')

// Early validation of critical environment variables
if (!process.env.SESSION_SECRET) {
  console.error('CRITICAL ERROR: SESSION_SECRET is not set!')
  console.error('In Railway dashboard, add: SESSION_SECRET=your-secret-key')
  process.exit(1)
}

// Validate Cloudinary environment variables (check both naming conventions)
const hasCloudinaryVars = (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ||
                          (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET)

if (!hasCloudinaryVars) {
  console.error('CRITICAL ERROR: Cloudinary environment variables are missing!')
  console.error('In Railway dashboard, you need to add:')
  console.error('- CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name')
  console.error('- CLOUDINARY_API_KEY=your-cloudinary-api-key')
  console.error('- CLOUDINARY_API_SECRET=your-cloudinary-api-secret')
  console.error('Get these from your Cloudinary dashboard at https://cloudinary.com/console')
  process.exit(1)
}

// Validate Email environment variables for password reset functionality
if (!process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
  console.warn('WARNING: No email service configured!')
  console.warn('Password reset functionality will not work without either:')
  console.warn('Option 1 (Recommended for Railway): RESEND_API_KEY=your-resend-api-key')
  console.warn('Option 2 (Local development): EMAIL_USER and EMAIL_PASS for SMTP')
  console.warn('Get Resend API key from: https://resend.com')
} else if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend API configured for email sending')
} else {
  console.log('✅ SMTP credentials configured for email sending')
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
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'Not in Railway')

// Railway-specific MongoDB connection handling
if (!mongoUrl) {
  console.error('ERROR: No MongoDB connection string found!')
  console.error('Please set either MONGO_URL or DB_STRING environment variable')
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DB')))
  process.exit(1)
}

// Clean and validate the MongoDB URL
const cleanMongoUrl = mongoUrl.trim()
console.log('Using MongoDB URL:', cleanMongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')) // Hide credentials in logs

// Check for SESSION_SECRET
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  console.warn('WARNING: SESSION_SECRET not found! Using fallback (INSECURE)')
  console.warn('Please set SESSION_SECRET in Railway environment variables ASAP')
  console.warn('Your app will work but sessions are not secure!')
} else {
  console.log('✅ SESSION_SECRET is properly configured')
}

// Enhanced MongoDB session store configuration for Railway
const sessionStore = MongoStore.create({
  mongoUrl: cleanMongoUrl,
  touchAfter: 24 * 3600, // lazy session update
  stringify: false, // Don't stringify session data
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Railway connection pool limit
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  },
  ttl: 7 * 24 * 60 * 60, // 7 days session TTL
  autoRemove: 'native', // Use MongoDB's native TTL
  collection: 'sessions', // Explicit session collection name
  clear_interval: 60 // Clear expired sessions every 60 seconds
})

// Debug session store events
sessionStore.on('connected', () => {
  console.log('✅ Session store connected to MongoDB successfully')
})

sessionStore.on('error', (error) => {
  console.error('❌ Session store error:', error)
  console.error('This might indicate MongoDB connection issues on Railway')
})

sessionStore.on('disconnected', () => {
  console.warn('⚠️ Session store disconnected from MongoDB')
})

// Railway-optimized session configuration
app.use(
  session({
    secret: sessionSecret || 'fallback-secret-key-for-emergency',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    rolling: true, // Reset session expiration on activity
    name: 'pet.social.sid', // Custom session name for Railway
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production', // Railway handles HTTPS
      httpOnly: true, // Prevent XSS attacks
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Railway CORS handling
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
