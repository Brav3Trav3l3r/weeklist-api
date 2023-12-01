const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');
const weekListRouter = require('./routes/weekListRoute');
const healthRouter = require('./routes/healthRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.requestedAt = new Date().toISOString();
  next();
});

app.use(morgan('dev'));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/weekLists', weekListRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
