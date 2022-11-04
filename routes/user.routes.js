const express = require('express');
const { signup, login, protect } = require('../controllers/auth.controller');
const { getAllUsers } = require('../controllers/user.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(protect, getAllUsers);

module.exports = router;
