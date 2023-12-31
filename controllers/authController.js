const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const getToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION
  });

  return token;
};

exports.protect = catchAsync(async (req, res, next) => {
  // Check if header have jwt token and validate it
  if (!req.headers.authorization) {
    return next(new AppError('You must login to accesss this route.'));
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // Check if user have not deleted account after jwt was issued
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('User belongs to this token no longer exist', 400)
    );
  }
  req.user = currentUser;

  // Check if user have changed password after token is created

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  // check if email and password exist in body
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Must provide email and password', 400));
  }

  // check if email and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Email or password is incorrect', 400));
  }

  // create token and send it
  const token = getToken(user.id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age,
    mobile: req.body.mobile,
    gender: req.body.gender
  });
  const token = getToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});
