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

    let backgroundImage = req.body.backgroundImage || '';
    if (req.file) {
      if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
        try {
          const r2Key = `courses/${Date.now()}-${req.file.originalname}`;
          const { PutObjectCommand } = require('@aws-sdk/client-s3');
          const r2Client = require('../configs/s3Client');
          const fs = require('fs');
          await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
            Key: r2Key,
            Body: fs.readFileSync(req.file.path),
            ContentType: req.file.mimetype,
          }));
          fs.unlinkSync(req.file.path);
          const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-yoursubdomain.r2.dev';
          backgroundImage = `${publicUrl.replace(/\/$/, '')}/${r2Key}`;
        } catch (err) {
          console.error('R2 upload failed, falling back to local file:', err);
          backgroundImage = `/uploads/${req.file.filename}`;
        }
      } else {
        backgroundImage = `/uploads/${req.file.filename}`;
      }
    }

    const isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    const price = req.body.price ? Number(req.body.price) : 0;

    const course = await Course.create({
      ...req.body,
      isPublished,
      price,
      backgroundImage,
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
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    let backgroundImage = req.body.backgroundImage !== undefined ? req.body.backgroundImage : course.backgroundImage;
    if (req.file) {
      if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
        try {
          const r2Key = `courses/${Date.now()}-${req.file.originalname}`;
          const { PutObjectCommand } = require('@aws-sdk/client-s3');
          const r2Client = require('../configs/s3Client');
          const fs = require('fs');
          await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
            Key: r2Key,
            Body: fs.readFileSync(req.file.path),
            ContentType: req.file.mimetype,
          }));
          fs.unlinkSync(req.file.path);
          const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-yoursubdomain.r2.dev';
          backgroundImage = `${publicUrl.replace(/\/$/, '')}/${r2Key}`;
        } catch (err) {
          console.error('R2 upload failed, falling back to local file:', err);
          backgroundImage = `/uploads/${req.file.filename}`;
        }
      } else {
        backgroundImage = `/uploads/${req.file.filename}`;
      }
    }

    const updateData = { ...req.body };
    if (req.file || req.body.backgroundImage !== undefined) {
      updateData.backgroundImage = backgroundImage;
    }
    if (updateData.isPublished !== undefined) {
      updateData.isPublished = updateData.isPublished === 'true' || updateData.isPublished === true;
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price || 0);
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // Delete image if local or in R2
    if (course.backgroundImage && course.backgroundImage.startsWith('/uploads/')) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', path.basename(course.backgroundImage));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete course image file:', err);
        }
      }
    } else if (course.backgroundImage && course.backgroundImage.includes('courses/')) {
      const matchIndex = course.backgroundImage.indexOf('courses/');
      if (matchIndex !== -1) {
        const r2Key = course.backgroundImage.substring(matchIndex);
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const r2Client = require('../configs/s3Client');
        r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
          Key: r2Key,
        })).catch(err => {
          console.error('Failed to delete course image from Cloudflare R2:', err);
        });
      }
    }

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
    if (course.enrolledStudents.some(id => id.toString() === req.user._id.toString()))
      return res.status(400).json({ message: 'Already enrolled' });
    
    let Model = User;
    if (req.user.role === 'admin') Model = Admin;
    else if (req.user.role === 'instructor') Model = Instructor;

    course.enrolledStudents.push(req.user._id);
    await course.save();
    await Model.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: course._id } });
    res.json({ message: 'Enrolled successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my courses (enrolled or created)
const getMyCourses = async (req, res) => {
  try {
    let Model = User;
    if (req.user.role === 'admin') Model = Admin;
    else if (req.user.role === 'instructor') Model = Instructor;

    const user = await Model.findById(req.user._id)
      .populate({ path: 'enrolledCourses', populate: { path: 'instructor', select: 'name avatar' } })
      .populate({ path: 'createdCourses', populate: { path: 'instructor', select: 'name avatar' } });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      enrolled: user.enrolledCourses || [],
      created: user.createdCourses || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses };
