const User = require('../models/User');
const Course = require('../models/Course');
const Material = require('../models/Material');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');

// Dashboard stats
const getStats = async (req, res) => {
  try {
    const [studentCount, instructorCount, adminCount, courses, materials] = await Promise.all([
      User.countDocuments(),
      Instructor.countDocuments(),
      Admin.countDocuments(),
      Course.countDocuments(),
      Material.countDocuments(),
    ]);
    res.json({ 
      users: studentCount + instructorCount + adminCount, 
      courses, 
      materials, 
      students: studentCount, 
      instructors: instructorCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [students, instructors, admins] = await Promise.all([
      User.find().select('-password').lean(),
      Instructor.find().select('-password').lean(),
      Admin.find().select('-password').lean(),
    ]);
    
    const allUsers = [
      ...students.map(u => ({ ...u, role: u.role || 'student' })),
      ...instructors.map(u => ({ ...u, role: u.role || 'instructor' })),
      ...admins.map(u => ({ ...u, role: u.role || 'admin' }))
    ];
    
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role / status
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    let user = await User.findById(req.params.id);
    let Model = User;
    
    if (!user) {
      user = await Instructor.findById(req.params.id);
      Model = Instructor;
    }
    if (!user) {
      user = await Admin.findById(req.params.id);
      Model = Admin;
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If the role is changing, move the user document to the correct collection
    if (role && role !== user.role) {
      await Model.findByIdAndDelete(req.params.id);
      
      let NewModel = User;
      if (role === 'admin') NewModel = Admin;
      else if (role === 'instructor') NewModel = Instructor;
      
      const userDoc = user.toObject ? user.toObject() : user;
      delete userDoc._id;
      delete userDoc.id;
      
      const newUser = await NewModel.create({
        ...userDoc,
        _id: req.params.id,
        role,
        isActive: isActive !== undefined ? isActive : user.isActive,
      });
      
      return res.json(newUser);
    }
    
    const updatedUser = await Model.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const [deletedStudent, deletedInstructor, deletedAdmin] = await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Instructor.findByIdAndDelete(req.params.id),
      Admin.findByIdAndDelete(req.params.id)
    ]);
    
    const user = deletedStudent || deletedInstructor || deletedAdmin;
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
