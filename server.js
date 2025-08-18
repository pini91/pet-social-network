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

// Use .env file in config folder
require('dotenv').config({ path: './config/.env' })

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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_STRING,
      touchAfter: 24 * 3600 // lazy session update
    })
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
