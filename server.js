const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './dotenv.config' });

const app = require('./app');

mongoose
  .connect(process.env.DB_STRING)
  .then('Connected to database successfully');

const PORT = process.env.PORT || 8000;

app.listen(PORT, 'localhost', () => {
  console.log('listening on port ' + PORT);
});
