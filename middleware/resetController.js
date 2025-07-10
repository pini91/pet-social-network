const express = require('express');

const app = express();

const crypto = require("crypto");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");



module.exports={

    getForgotPassword: (req, res) => {
    res.render("forgotPassword.ejs", { user: req.user });
   },

    getResetPassword : async (req, res) => {
        try {
            const user = await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                req.flash("error", "Password reset token is invalid or has expired.");
                return res.redirect("/forgot-password");
            }

            res.render("resetPassword", { token: req.params.token });
        } catch (err) {
            console.error(err);
            req.flash("error", "Something went wrong. Please try again.");
            res.redirect("/forgot-password");
        }
},

    forgotPassword : async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email: email });

            console.log(user)

            if (!user) {
                req.flash("error", "No account with that email found.");
                return res.redirect("/forgot-password");
            }

            // Generate token using crypto
            const token = crypto.randomBytes(20).toString("hex"); //This is a method from Node.js's built-in crypto module. It generates 20 cryptographically strong pseudo-random bytes..toString("hex"): This converts the generated random bytes (which are in a Buffer object) into a hexadecimal string representation.
            console.log("Generated token:", token);

            // Set token and expiry on user
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();
            console.log("User saved with token");

            //FUNCTION FOR THE EMAIL RESERVATION
            async function main() {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                secure: false, // true for 465, false for other ports
                auth: {
                user: process.env.EMAIL_USER, // generated brevo user
                pass: process.env.EMAIL_PASS , // generated brevo password
                },
            });
            
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'testingmyaps@gmail.com', // sender address
                to: user.email, // receiver
                subject: "Password Reset", // Subject line
                text: `You requested a password reset. Click the link below to reset your password:\n\n
                http://localhost:2121/reset-password/${token}

                If you did not request this, please ignore this email.`,
            });
            
            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
            }
            
            main().catch(console.error);

            req.flash("info", "An email has been sent with further instructions.");
            res.redirect("/forgot-password");

        } catch (err) {
            console.error(err);
            req.flash("error", "Error sending reset email. Please try again.");
            res.redirect("/forgot-password");
        }
},
    postResetPassword : async (req, res) => {
        try {

            const { password, confirm } = req.body;
            if (password !== confirm) {
                req.flash("error", "Passwords do not match.");
                return res.redirect("back");
            }

            const user = await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                req.flash("error", "Password reset token is invalid or has expired.");
                return res.redirect("/forgot-password");
            }

            // Set the new password - the User model will hash it automatically!
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            //the pre-save middleware automatically hashes the password
            await user.save();


            req.flash("info", "Your password has been reset. Please log in.");
            res.redirect("/login");
        } catch (err) {
            console.error(err);
            req.flash("error", "Something went wrong. Please try again.");
            res.redirect("/forgot-password");
        }
},


}