const User = require('./userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const { promisify } = require('util');

// JWT TOKEN
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRY,
  });
};

// ASYNC WRAP
const wrap = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// CRUD HANDLERS
// GET ALL USERS
exports.getAll = wrap(async (req, res) => {
  const queryObj = { ...req.query };
  const exclusions = ['page', 'limit', 'sort', 'fields'];
  exclusions.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (el) => `$${el}`);
  queryStr = JSON.parse(queryStr);

  let query = User.find(queryStr);

  // SORT
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-role');
  }

  // PROJECTION
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // PAGINATION
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.limit(limit).skip(skip);

  const allUsers = await query;

  res.status(200).json({
    status: 'success',
    allUsers,
  });
});

// CREATE USERS
exports.createUser = wrap(async (req, res, next) => {
  const createdUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(createdUser.id);

  res.status(201).json({
    status: 'created',
    token,
    createdUser,
  });
});

// AUTHENTICATION HANDLERS
exports.login = wrap(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Enter email and password', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePass(password, user.password))) {
    return next(new AppError('Invalid username or password', 403));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.authenticate = wrap(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    next(new AppError('Please log in', 403));
  }

  const token = req.headers.authorization.split(' ')[1];

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWTSECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(new AppError('no such user', 403));
  }

  req.user = user;
  next();
});
