const Course = require('../models/Course');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');

// Get all published courses
const getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(filter).populate('instructor', 'name avatar');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single course
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('materials');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create course
const createCourse = async (req, res) => {
  try {
    let instructorModel = 'User';
    let Model = User;

    if (req.user.role === 'admin') {
      instructorModel = 'Admin';
      Model = Admin;
    } else if (req.user.role === 'instructor') {
      instructorModel = 'Instructor';
      Model = Instructor;
    }

    const course = await Course.create({
      ...req.body,
      instructor: req.user._id,
      instructorModel
    });

    await Model.findByIdAndUpdate(req.user._id, { $push: { createdCourses: course._id } });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Enroll in course
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.enrolledStudents.includes(req.user._id))
      return res.status(400).json({ message: 'Already enrolled' });
    course.enrolledStudents.push(req.user._id);
    await course.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: course._id } });
    res.json({ message: 'Enrolled successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my courses (enrolled or created)
const getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'enrolledCourses', populate: { path: 'instructor', select: 'name avatar' } })
      .populate({ path: 'createdCourses', populate: { path: 'instructor', select: 'name avatar' } });
    res.json({
      enrolled: user.enrolledCourses,
      created: user.createdCourses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses };
