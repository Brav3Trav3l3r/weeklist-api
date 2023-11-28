const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.requestedAt = new Date().toISOString();
  next();
});

app.use(morgan('dev'));

app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

module.exports = app;
