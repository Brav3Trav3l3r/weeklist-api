exports.login = (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: 'Something went wrong'
  });

  next();
};

exports.signup = (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: 'SIGNUP Failed'
  });

  next();
};
