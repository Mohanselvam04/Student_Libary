const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  me, 
  redirect, 
  firebaseLogin, 
  firebaseRegister,
  getAdminCardVisibility,
  setAdminCardVisibility,
  getInstructorCardVisibility,
  setInstructorCardVisibility,
  getStudentCardVisibility,
  setStudentCardVisibility
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase-login', firebaseLogin);
router.post('/firebase-register', firebaseRegister);
router.get('/redirect', protect, redirect);
router.get('/me', protect, me);
router.get('/admin-card-visibility', getAdminCardVisibility);
router.post('/admin-card-visibility', setAdminCardVisibility);
router.get('/instructor-card-visibility', getInstructorCardVisibility);
router.post('/instructor-card-visibility', setInstructorCardVisibility);
router.get('/student-card-visibility', getStudentCardVisibility);
router.post('/student-card-visibility', setStudentCardVisibility);

module.exports = router;

