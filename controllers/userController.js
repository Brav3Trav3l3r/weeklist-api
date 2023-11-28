exports.getUser = (req, res, next) => {
  res.status('500').json({
    status: 'fail',
    message: 'Something went wrong'
  });
  next();
};
