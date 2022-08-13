const express = require('express');
const morgan = require('morgan');
const userRouting = require('./userRoutes');
const globalErrorHandler = require('./errorController');
const AppError = require('./AppError');

// APP
const app = express();

// MIDDLEWARES
// FOR POST REQ
app.use(express.json());

// LOGGER
app.use(morgan('dev'));

// Custom
app.use((req, res, next) => {
  console.log('custom MID');
  next();
});

app.use('/api/v1/users', userRouting);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError('no such page', 404));
});

app.use(globalErrorHandler);

module.exports = app;
