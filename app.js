const path = require('path');
const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.routes');
const chatRouter = require('./routes/chat.routes');
const messageRouter = require('./routes/message.routes');

const globalErrorHandler = require('./controllers/error.controller');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// if (process.env.NODE_ENV) {
//   const morgan = require('morgan');
//   app.use(morgan('dev'));
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/message', messageRouter);

app.use('*', (req, res) => {
  const message = `${req.originalUrl} route is not defined`;
  res.status(400).json({
    status: 'fail',
    message,
  });
});

app.use(globalErrorHandler);

module.exports = app;
