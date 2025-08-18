const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
})

// Password hash middleware.

UserSchema.pre('save', function save (next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

// Helper method for validating user's password.

// .methods is a Mongoose feature that allows you to add custom instance methods to your schema
UserSchema.methods.comparePassword = function comparePassword (
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => { // bcrypt.compare() is a function used in conjunction with bcrypt.hash() to securely verify if a provided plain-text password matches a stored hashed password without ever storing or handling the plain-text password directly
    cb(err, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
// Where theres "user" there goes the name of the collection, but for some reason mongodb puts a lowercase in the beginning and a s at the end.
// If you want mongodb to respect the name youve given you should write it like this:  mongoose.model("User", UserSchema,"Here the name(again I guess)")
