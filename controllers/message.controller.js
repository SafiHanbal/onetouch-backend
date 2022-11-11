const catchAsync = require('../utils/catch-async.utils');
const AppError = require('../utils/app-error.utils');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId)
    return next(new AppError('Invalid data passed into request'));

  let message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  message = await message.populate('sender', 'name pic');
  message = await message.populate('chat');
  message = await User.populate(message, { path: 'chat.user' });

  await Chat.findByIdAndUpdate(req.body.chatId, {
    latestMessage: message,
  });

  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const messages = await Message.find({ chat: chatId })
    .populate('sender')
    .populate('chat');

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
