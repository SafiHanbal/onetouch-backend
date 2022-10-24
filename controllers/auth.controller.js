const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catch-async.utils');
const AppError = require('../utils/app-error.utils');
const User = require('../models/user.model');

const createAndSendToken = (res, statusCode, user) => {
  const { _id, name, email, image } = user;
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user: {
        _id,
        name,
        email,
        image,
      },
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, confirmPassword, image } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    image,
  });

  if (!user) next(new AppError('Error in creating user!', 500));

  createAndSendToken(res, 201, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect user or password!', 404));

  createAndSendToken(res, 200, user);
});
