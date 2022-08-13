process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.error(err.name, '------***********-----', err.message);
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const mongoose = require('mongoose');
const User = require('./userModel');

// DB
const DB = process.env.LOCAL_DB;

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(console.log('DB Connected'))
  .catch((err) => console.error(err));

// SERVER
const server = app.listen(2000, '127.0.0.1', () => {
  console.log('server ON');
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection');
  console.error(err.name, '------***********-----', err.message);

  server.close(() => {
    process.exit(1);
  });
});
