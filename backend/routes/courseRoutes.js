const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses } = require('../controllers/courseController');
const { protect, instructorOrAdmin } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/my', protect, getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, instructorOrAdmin, createCourse);
router.put('/:id', protect, instructorOrAdmin, updateCourse);
router.delete('/:id', protect, instructorOrAdmin, deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;
