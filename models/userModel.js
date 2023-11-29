const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Fullname is required']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Email is not valid']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be male or female'
    },
    required: [true, 'Gender is required']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile is required'],
    validate: {
      validator: function(value) {
        return validator.isMobilePhone(value, 'en-IN');
      },
      message: 'Mobile is not valid'
    }
  }
});

userSchema.pre('save', async function(next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
