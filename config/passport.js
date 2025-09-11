const LocalStrategy = require('passport-local').Strategy
const User = require('../models/User')

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        const user = await User.findOne({ email: email.toLowerCase() }) //, (err, user) => {
        // if (err) {
        //   return done(err);
        // }
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` })
        }
        if (!user.password) {
          return done(null, false, {
            msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.'
          })
        }
        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            return done(err)
          }
          if (isMatch) {
            return done(null, user)
          }
          return done(null, false, { msg: 'Invalid email or password.' })
        })
        // });
      }
    )
  )

  passport.serializeUser((user, done) => {
    console.log('🔐 Serializing user:', user.email, 'with ID:', user.id)
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    console.log('🔓 Deserializing user with ID:', id)
    User.findById(id) // when we want the user to come out of the session, we will grab that user id that was store there and find it in the database
      .then(user => {
        if (user) {
          console.log('✅ User found during deserialization:', user.email)
          done(null, user)
        } else {
          console.log('❌ User not found during deserialization for ID:', id)
          done(null, false)
        }
      })
      .catch(function (err) {
        console.error('❌ Database error during deserialization:', err)
        done(err, null)
      })
  })
}

//   passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
//     User.findOne({ email: email.toLowerCase() }, (err, user) => {
//       if (err) { return done(err) }
//       if (!user) {
//         return done(null, false, { msg: `Email ${email} not found.` })
//       }
//       if (!user.password) {
//         return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' })
//       }
//       user.comparePassword(password, (err, isMatch) => {
//         if (err) { return done(err) }
//         if (isMatch) {
//           return done(null, user)
//         }
//         return done(null, false, { msg: 'Invalid email or password.' })
//       })
//     })
//   }))

//   passport.serializeUser((user, done) => {
//     done(null, user.id)
//   })

//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => done(err, user))
//   })
// }
