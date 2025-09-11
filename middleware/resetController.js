// const express = require('express') // Not used in this module
// const app = express() // Not used in this module
const crypto = require('crypto') // to create the token
const User = require('../models/User')
// const nodemailer = require('nodemailer') // Not needed for Resend HTTP API
// For Resend HTTP API (Railway-compatible)
const fetch = require('node-fetch')

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
        console.log('=== EMAIL DEBUG INFO ===')
        console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'NOT SET')
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET')
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET')
        console.log('NODE_ENV:', process.env.NODE_ENV)
        console.log('========================')

        // Determine the base URL for the reset link
        const baseUrl = process.env.NODE_ENV === 'production'
          ? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://pet-social-app.up.railway.app')
          : 'http://localhost:2121'

        const resetLink = `${baseUrl}/reset-password/${token}`
        const emailContent = `
        You requested a password reset. Click the link below to reset your password:<br>
        ${resetLink}<br>
        If you did not request this, please ignore this email.`

        // Try Resend first (HTTP API - Railway compatible)

        const RESEND_AUTH_KEY = process.env.RESEND_API_KEY

        const payload = {
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: 'Reset Password',
          html: `<p>${emailContent}</p>`
        }
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_AUTH_KEY}`
          },
          body: JSON.stringify(payload)
        }

        fetch('https://api.resend.com/emails', requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error))

        // if (process.env.RESEND_API_KEY) {
        //   console.log('Attempting to send email via Resend HTTP API...')
        //   try {
        //     const response = await fetch('https://api.resend.com/emails', {
        //       method: 'POST',
        //       headers: {
        //         Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        //         'Content-Type': 'application/json'
        //       },
        //       body: JSON.stringify({
        //         from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        //         to: [user.email],
        //         subject: 'Password Reset',
        //         html: emailContent
        //       })
        //     })

        //     if (response.ok) {
        //       const result = await response.json()
        //       console.log('Email sent successfully via Resend:', result.id)
        //       return result
        //     } else {
        //       const error = await response.text()
        //       console.error('Resend API failed:', response.status, error)
        //       throw new Error(`Resend API error: ${response.status} ${error}`)
        //     }
        //   } catch (resendError) {
        //     console.error('Resend failed:', resendError.message)
        //     console.log('Falling back to SMTP...')
        //   }
        // } else {
        //   console.log('No RESEND_API_KEY found, trying SMTP...')
        // }

        // If we reach here, either Resend failed or wasn't configured
        // throw new Error('Email sending failed. Please check your email configuration (RESEND_API_KEY)')

        // Fallback to SMTP (will fail on Railway but kept for local development)
        // if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        //   throw new Error('No email configuration found. Please set either RESEND_API_KEY or EMAIL_USER/EMAIL_PASS')
        // }

        // console.log('Attempting SMTP fallback (note: this will fail on Railway)...')
        // const smtpConfig = {
        //   host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        //   port: parseInt(process.env.EMAIL_PORT) || 587,
        //   secure: false,
        //   auth: {
        //     user: process.env.EMAIL_USER,
        //     pass: process.env.EMAIL_PASS
        //   }
        // }

        // const transporter = nodemailer.createTransport(smtpConfig)

        // try {
        //   const info = await transporter.sendMail({
        //     from: process.env.EMAIL_FROM || 'brenda.loncaric@gmail.com',
        //     to: user.email,
        //     subject: 'Password Reset',
        //     text: emailContent
        //   })

        //   console.log('Email sent via SMTP:', info.messageId)
        //   return info
        // } catch (smtpError) {
        //   console.error('SMTP also failed:', smtpError.message)
        //   throw new Error(`Both Resend and SMTP failed. Resend not configured, SMTP error: ${smtpError.message}`)
        // }
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
