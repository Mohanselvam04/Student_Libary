const User = require('../models/User');
const Course = require('../models/Course');
const Material = require('../models/Material');

// Dashboard stats
const getStats = async (req, res) => {
  try {
    const [users, courses, materials, students, instructors] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Material.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
    ]);
    res.json({ users, courses, materials, students, instructors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role / status
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all courses (admin view)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email').sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Publish/unpublish course
const toggleCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getAllUsers, updateUser, deleteUser, getAllCourses, toggleCourse };
