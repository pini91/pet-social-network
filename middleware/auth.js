module.exports = {
  ensureAuth: function (req, res, next) {
    console.log('ensureAuth check:', {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      userID: req.user ? req.user._id : 'No user',
      url: req.originalUrl
    })

    if (req.isAuthenticated()) {
      return next()
    } else {
      console.log('Authentication failed, redirecting to /')
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
