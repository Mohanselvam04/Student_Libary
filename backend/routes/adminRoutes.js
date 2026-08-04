const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUser, deleteUser, getAllCourses, toggleCourse, enrollUserInCourse, unenrollUserFromCourse } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);
router.patch('/courses/:id/toggle', toggleCourse);
router.post('/enroll', enrollUserInCourse);
router.post('/unenroll', unenrollUserFromCourse);

module.exports = router;
