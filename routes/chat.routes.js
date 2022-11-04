const express = require('express');
const { protect } = require('../controllers/auth.controller');
const {
  getChats,
  accessChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require('../controllers/chat.controller');

const router = express.Router();

router.use(protect);

router.route('/').get(getChats).post(accessChat);
router.route('/group').post(createGroupChat);
router.route('/rename').patch(renameGroup);
router.route('/add-to-group').patch(addToGroup);
router.route('/remove-from-group').patch(removeFromGroup);

module.exports = router;
