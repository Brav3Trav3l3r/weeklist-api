const catchAsync = require('../utils/catchAsync');

exports.getHealth = catchAsync(async (req, res, next) => {
  res.status(200).json({
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    requestedAt: res.requestedAt
  });
});
