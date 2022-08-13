const express = require('express');
const userController = require('./userController');

const Router = express.Router();

Router.post('/login', userController.login);

Router.route('/')
  .get(userController.authenticate, userController.getAll)
  .post(userController.createUser);

module.exports = Router;
