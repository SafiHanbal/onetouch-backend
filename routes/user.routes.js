const express = require('express');
const {
  signup,
  login,
  logout,
  protect,
  uploadUserPhoto,
} = require('../controllers/auth.controller');
const { getAllUsers } = require('../controllers/user.controller');

const router = express.Router();

router.get('/check', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Get request is working!',
  });
});

router.post('/signup', uploadUserPhoto, signup);
router.post('/login', login);
router.get('/logout', logout);

router.route('/').get(protect, getAllUsers);

module.exports = router;
