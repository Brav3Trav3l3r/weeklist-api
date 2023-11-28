const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('Uncaught exception 💥');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './dotenv.config' });

const app = require('./app');

mongoose
  .connect(process.env.DB_STRING)
  .then('Connected to database successfully');

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, 'localhost', () => {
  console.log('listening on port ' + PORT);
});

// catch left out async errors
process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection 💥');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
