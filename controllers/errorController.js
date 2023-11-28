const AppError = require('../utils/appError');

const sendProdError = (res, err) => {
  console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    //Programming errors: not suppose to send to the client
    res.status(500).json({
      status: 500,
      message: 'Something went wrong'
    });
  }
};

const sendDevError = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (process.env.NODE_ENV.trim() === 'production') {
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err)
    );
    if (error.code === 11000) {
      error = new AppError('Email is already in use', 401);
    }
    if (error.name === 'ValidationError') {
      error = new AppError(error.message, 402);
    }
    sendProdError(res, error);
  } else if (process.env.NODE_ENV === 'development') {
    sendDevError(res, err);
  }
};
