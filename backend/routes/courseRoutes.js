const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses } = require('../controllers/courseController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', getCourses);
router.get('/my', protect, getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, adminOnly, upload.single('backgroundImageFile'), createCourse);
router.put('/:id', protect, adminOnly, upload.single('backgroundImageFile'), updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;
