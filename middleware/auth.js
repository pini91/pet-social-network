module.exports = {
  ensureAuth: function (req, res, next) {
    console.log('🔍 ensureAuth check:', {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      userID: req.user ? req.user._id : 'No user',
      url: req.originalUrl,
      session: req.session ? 'Session exists' : 'No session',
      passport: req.session && req.session.passport ? 'Passport data exists' : 'No passport data',
      cookies: req.headers.cookie ? 'Cookies present' : 'No cookies',
      environment: process.env.NODE_ENV || 'development'
    })

    // Additional Railway debugging
    if (!req.isAuthenticated()) {
      console.log('❌ Authentication failed details:', {
        hasSession: !!req.session,
        sessionData: req.session ? Object.keys(req.session) : 'none',
        passportUser: req.session && req.session.passport ? req.session.passport.user : 'none',
        cookieSettings: req.sessionStore ? 'Store exists' : 'No store'
      })
    }

    if (req.isAuthenticated()) {
      console.log('✅ Authentication successful, proceeding to:', req.originalUrl)
      return next()
    } else {
      console.log('❌ Authentication failed, redirecting to /')
      res.redirect('/')
    }
  }
  // ensureGuest: function (req, res, next) {
  //   if (!req.isAuthenticated()) {
  //     return next();
  //   } else {
  //     res.redirect("/dashboard");
  //   }
  // },
}
