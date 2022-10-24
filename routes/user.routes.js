const express = require('express');
const { signup, login } = require('../controllers/auth.controller');
const { getAllUsers } = require('../controllers/user.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getAllUsers);

module.exports = router;
