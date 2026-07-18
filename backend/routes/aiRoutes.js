const express = require('express');
const router = express.Router();
const { aiChat } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/chat', protect, aiChat);

module.exports = router;
