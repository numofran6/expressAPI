const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have name'],
  },
  email: {
    type: String,
    required: [true, 'Must have email'],
    unique: true,
    validate: [validator.isEmail, 'User proper email format'],
  },
  password: {
    type: String,
    required: [true, 'Must have password'],
    minlength: [7, 'Password must be at least 7 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  role: {
    type: Number,
    default: 1,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.comparePass = function (candidatePass, existnPass) {
  return bcrypt.compare(candidatePass, existnPass);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
