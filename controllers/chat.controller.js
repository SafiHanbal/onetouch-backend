const catchAsync = require('../utils/catch-async.utils');
const AppError = require('../utils/app-error.utils');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

exports.getChats = catchAsync(async (req, res, next) => {
  const chat = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate('users')
    .populate('groupAdmin')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    body: {
      results: chat.length,
      chat,
    },
  });
});

exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId)
    return next(
      new AppError('Please provide a user for one on one chat!', 400)
    );

  const chats = await Chat.find({
    isGroupChat: false,
    $and: [{ users: req.user._id }, { users: userId }],
  })
    .populate('users', '-role')
    .populate('latestMessage');

  console.log(chats);

  // When chat does not exist
  if (!chats.length) {
    const newChat = await (
      await Chat.create({ users: [req.user._id, userId] })
    ).populate('users', '-role');

    res.status(201).json({
      status: 'success',
      data: {
        newChat,
      },
    });
  } else {
    res.status(200).json({
      status: 'success',
      chats,
    });
  }
});

exports.createGroupChat = catchAsync(async (req, res, next) => {
  const { chatName, users } = req.body;

  if (!chatName || !users?.length > 1)
    return next(
      new AppError('Please provide chatName and more than one users users', 400)
    );
  console.log(true);

  const createdChat = await Chat.create({
    chatName,
    users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const groupChat = await Chat.findById(createdChat._id)
    .populate('users')
    .populate('groupAdmin');

  res.status(201).json({
    status: 'success',
    data: {
      groupChat,
    },
  });
});

exports.renameGroup = catchAsync(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName)
    return next(new AppError('Please provide chatId and chatName!', 400));

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate('users')
    .populate('groupAdmin');

  res.status(200).json({
    status: 'success',
    data: {
      groupChat: updatedChat,
    },
  });
});

exports.addToGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate('users')
    .populate('groupAdmin');

  res.status(200).json({
    status: 'success',
    data: {
      groupChat: added,
    },
  });
});

exports.removeFromGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users')
    .populate('groupAdmin');

  res.status(200).json({
    status: 'success',
    data: {
      groupChat: removed,
    },
  });
});
