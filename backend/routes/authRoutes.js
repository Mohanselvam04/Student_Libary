const express = require('express');
const router = express.Router();
const { register, login, me, redirect } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/redirect', protect, redirect);
router.get('/me', protect, me);

module.exports = router;
