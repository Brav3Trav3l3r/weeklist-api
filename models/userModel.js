const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    reqired: true
  },
  email: {
    type: String,
    reqired: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: String,
    reqired: true
  },
  gender: {
    type: String,
    reqired: true
  },
  mobile: {
    type: Number,
    reqired: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
