const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const slugify = require('slugify');
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

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];

    const fileName = `user-${slugify(req.body.name, { lower: true })}-${slugify(
      file.originalname.split('.')[0],
      { lower: true }
    )}-${Date.now()}.${ext}`;

    console.log(fileName);
    cb(null, fileName);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('image');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  let image;
  if (req.file) image = `http://127.0.0.1:8000/images/${req.file.filename}`;
  else image = undefined;

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
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect user or password!', 404));

  createAndSendToken(res, 200, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer'))
    return next(new AppError('Please login to continue', 401));

  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  req.user = user;
  next();
});
