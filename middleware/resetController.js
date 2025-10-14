const FormData = require('form-data') // form-data v4.0.1
const Mailgun = require('mailgun.js') // mailgun.js v11.1.0

const crypto = require('crypto') // to create the token
const User = require('../models/User')
module.exports = {

  getForgotPassword: (req, res) => {
    res.render('forgotPassword.ejs', { user: req.user })
  },
  getResetPassword: async (req, res) => {
    try {
      const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      })

      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.')
        return res.redirect('/forgot-password')
      }

      res.render('resetPassword', { token: req.params.token })
    } catch (err) {
      console.error(err)
      req.flash('error', 'Something went wrong. Please try again.')
      res.redirect('/forgot-password')
    }
  },

  forgotPassword: async (req, res) => {
    // try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      req.flash('error', 'No account with that email found.')
      return res.redirect('/forgot-password')
    }
    // Generate token using crypto
    const token = crypto.randomBytes(20).toString('hex') // This is a method from Node.js's built-in crypto module. It generates 20 cryptographically strong pseudo-random bytes..toString("hex"): This converts the generated random bytes (which are in a Buffer object) into a hexadecimal string representation.
    console.log('Generated token:', token)

    // Set token and expiry on user
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

    await user.save()
    console.log('User saved with token')

    // Determine the base URL for the reset link
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://pet-social-app.up.railway.app')
      : 'http://localhost:2121'

    const resetLink = `${baseUrl}/reset-password/${token}`

    const emailContent = `
        Password Reset Request
        You requested a password reset for your Pet Social Network account.
        Click the link below to reset your password:
        ${resetLink}
        This link will expire in 1 hour.
        If you did not request this, please ignore this email.
      `

    // FUNCTION FOR THE EMAIL
    async function sendSimpleMessage () {
      const mailgun = new Mailgun(FormData)
      const mg = mailgun.client({
        username: 'api',
        key: process.env.API_KEY || 'API_KEY'
      })
      try {
        const data = await mg.messages.create('brenda-app.dev', {
          from: 'Mailgun Sandbox <postmaster@brenda-app.dev>',
          to: `${user.email}`,
          subject: 'Reset Pet Social Network Password',
          text: emailContent
        })

        console.log(data)
      } catch (error) {
        console.log(error) // logs any error
      }
    }

    sendSimpleMessage()

    req.flash('info', 'An email has been sent with further instructions.')
    res.redirect('/forgot-password')
    // } catch (error) {
    //   console.log(error) // logs any error
    // }
  },

  postResetPassword: async (req, res) => {
    try {
      const { password, confirm } = req.body
      if (password !== confirm) {
        req.flash('error', 'Passwords do not match.')
        return res.redirect('back')
      }

      const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      })

      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.')
        return res.redirect('/forgot-password')
      }

      // Set the new password - the User model will hash it automatically!
      user.password = password
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      // the pre-save middleware automatically hashes the password
      await user.save()

      req.flash('info', 'Your password has been reset. Please log in.')
      res.redirect('/login')
    } catch (err) {
      console.error(err)
      req.flash('error', 'Something went wrong. Please try again.')
      res.redirect('/forgot-password')
    }
  },

  changePassword: (req, res) => {
    res.render('changePassword.ejs', { user: req.user })
  },

  currentPassword: async (req, res) => {
    try {
      const user = req.user
      const { currentPassword } = req.body

      // Check if the current password is correct using the User model's comparePassword method
      user.comparePassword(currentPassword, (err, isMatch) => {
        if (err) {
          console.error(err)
          req.flash('error', 'Something went wrong. Please try again.')
          return res.redirect('/changePassword')
        }

        if (!isMatch) {
          req.flash('error', 'Current password is incorrect.')
          return res.redirect('/changePassword')
        }
        console.log('Current password verified successfully:')
        // If password matches, you can proceed with password change logic
        req.flash('success', 'Current password verified successfully.')
        res.redirect('/newPassword')
      })
    } catch (err) {
      console.error(err)
      req.flash('error', 'Something went wrong. Please try again.')
      res.redirect('/changePassword')
    }
  },
  renderNewPassword: (req, res) => {
    res.render('newPassword.ejs', { user: req.user })
  },

  newPassword: async (req, res) => {
    try {
      const user = req.user
      const { password, confirm } = req.body // Match the form field names

      // Validate that passwords are provided
      if (!password || !confirm) {
        req.flash('error', 'Please provide both password fields.')
        return res.redirect('/newPassword')
      }

      // Validate password length (optional but recommended)
      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters long.')
        return res.redirect('/newPassword')
      }

      if (password !== confirm) {
        req.flash('error', 'New passwords do not match.')
        return res.redirect('/newPassword')
      }

      // Set the new password
      user.password = password
      await user.save()

      req.flash('success', 'Your password has been changed successfully.')
      res.redirect('/profile')
    } catch (err) {
      console.error(err)
      req.flash('error', 'Something went wrong. Please try again.')
      res.redirect('/newPassword')
    }
  }

}
