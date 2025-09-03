// const express = require('express') // Not used in this module
// const app = express() // Not used in this module
const crypto = require('crypto') // to create the token
const User = require('../models/User')
const nodemailer = require('nodemailer')
// const bcrypt = require('bcrypt') // bcrypt methods are used via User model

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
    try {
      const { email } = req.body
      const user = await User.findOne({ email })

      console.log(user)

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

      // FUNCTION FOR THE EMAIL RESERVATION
      async function main () {
        // Validate email configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required')
        }

        // Debug email configuration
        console.log('=== EMAIL DEBUG INFO ===')
        console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com (default)')
        console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587 (default)')
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET')
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET')
        console.log('NODE_ENV:', process.env.NODE_ENV)
        console.log('========================')

        // Determine the base URL for the reset link
        const baseUrl = process.env.NODE_ENV === 'production'
          ? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://pet-social-app.up.railway.app')
          : 'http://localhost:2121'

        const smtpConfig = {
          host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true for 465, false for other ports
          connectionTimeout: 120000, // Increased to 2 minutes
          greetingTimeout: 60000, // Increased to 1 minute
          socketTimeout: 120000, // Increased to 2 minutes
          // Add these options to help with Railway networking and Brevo
          pool: false, // Disable connection pooling
          maxConnections: 1,
          maxMessages: 1,
          requireTLS: true, // Force TLS
          tls: {
            // Don't fail on invalid certificates
            rejectUnauthorized: false
          },
          auth: {
            user: process.env.EMAIL_USER, // generated brevo user
            pass: process.env.EMAIL_PASS // generated brevo password
          }
        }

        // Alternative Brevo configuration with different port
        const brevoAlternativeConfig = {
          host: 'smtp-relay.brevo.com',
          port: 25, // Try port 25
          secure: false,
          connectionTimeout: 120000,
          greetingTimeout: 60000,
          socketTimeout: 120000,
          pool: false,
          requireTLS: true,
          tls: {
            rejectUnauthorized: false
          },
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }

        // Third Brevo config with port 2587
        const brevoPort2587Config = {
          host: 'smtp-relay.brevo.com',
          port: 2587,
          secure: false,
          connectionTimeout: 120000,
          greetingTimeout: 60000,
          socketTimeout: 120000,
          pool: false,
          requireTLS: true,
          tls: {
            rejectUnauthorized: false
          },
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }

        console.log('SMTP Configuration:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          hasAuth: !!smtpConfig.auth.user && !!smtpConfig.auth.pass
        })

        // Try primary Brevo configuration (port 587) first
        let transporter = nodemailer.createTransport(smtpConfig)
        let configUsed = 'Brevo (port 587)'

        console.log('Testing SMTP connection with Brevo on port 587...')
        try {
          await transporter.verify()
          console.log('✅ Brevo SMTP connection verified successfully on port 587')
        } catch (verifyError) {
          console.error('❌ Brevo port 587 failed:', verifyError.message)

          // Try Brevo on port 25
          console.log('Trying Brevo on port 25...')
          transporter = nodemailer.createTransport(brevoAlternativeConfig)
          configUsed = 'Brevo (port 25)'

          try {
            await transporter.verify()
            console.log('✅ Brevo SMTP connection verified successfully on port 25')
          } catch (port25Error) {
            console.error('❌ Brevo port 25 failed:', port25Error.message)

            // Try Brevo on port 2587
            console.log('Trying Brevo on port 2587...')
            transporter = nodemailer.createTransport(brevoPort2587Config)
            configUsed = 'Brevo (port 2587)'

            try {
              await transporter.verify()
              console.log('✅ Brevo SMTP connection verified successfully on port 2587')
            } catch (port2587Error) {
              console.error('❌ Brevo port 2587 failed:', port2587Error.message)
              console.error('All Brevo connection attempts failed.')

              // Provide detailed error information
              throw new Error(`All Brevo SMTP ports failed:
                Port 587: ${verifyError.message}
                Port 25: ${port25Error.message}  
                Port 2587: ${port2587Error.message}
                
                This appears to be a Railway network restriction blocking SMTP connections.
                You may need to contact Railway support or use a different email service.`)
            }
          }
        }

        // send mail with defined transport object
        console.log(`Sending email using ${configUsed}...`)
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'brenda.loncaric@gmail.com', // sender address
          to: user.email, // receiver
          subject: 'Password Reset', // Subject line
          text: `You requested a password reset. Click the link below to reset your password:\n\n
                ${baseUrl}/reset-password/${token}

                If you did not request this, please ignore this email.`
        })

        console.log('Message sent: %s', info.messageId)
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      }

      main().catch(console.error)

      req.flash('info', 'An email has been sent with further instructions.')
      res.redirect('/forgot-password')
    } catch (err) {
      console.error(err)
      req.flash('error', 'Error sending reset email. Please try again.')
      res.redirect('/forgot-password')
    }
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
