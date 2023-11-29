const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('💥 Uncaught exception');
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: './dotenv.config' });

const app = require('./app');

console.log(`Environment: ${process.env.NODE_ENV}`);

mongoose
  .connect(process.env.DB_CLOUD_STRING)
  .then(() => console.log('✅ Connected to database successfully.'));

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, 'localhost', () => {
  console.log(`Listening on port ${PORT}`);
});

// catch left out async errors
process.on('unhandledRejection', err => {
  console.log('💥 Unhandled Rejection');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
