const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.requestedAt = new Date().toISOString();
  next();
});

app.use(morgan('dev'));

app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  console.log(req.url);
  next(new AppError(`Route ${req.url} not found`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
