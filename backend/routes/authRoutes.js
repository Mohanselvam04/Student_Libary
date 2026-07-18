const express = require('express');
const router = express.Router();
const { register, login, me, redirect, firebaseLogin, firebaseRegister } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase-login', firebaseLogin);
router.post('/firebase-register', firebaseRegister);
router.get('/redirect', protect, redirect);
router.get('/me', protect, me);

module.exports = router;

