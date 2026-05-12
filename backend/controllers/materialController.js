const Material = require('../models/Material');
const Course = require('../models/Course');
const path = require('path');

// Upload material
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const typeMap = { pdf: 'pdf', mp4: 'video', webm: 'video', jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', doc: 'doc', docx: 'doc' };
    const type = typeMap[ext] || 'other';

    const material = await Material.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      type,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      course: req.body.courseId || null,
      uploadedBy: req.user._id,
      isPublic: req.body.isPublic === 'true',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });

    if (req.body.courseId) {
      await Course.findByIdAndUpdate(req.body.courseId, { $push: { materials: material._id } });
    }

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all materials (with filters)
const getMaterials = async (req, res) => {
  try {
    const { type, courseId, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (courseId) filter.course = courseId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Students see public or their enrolled course materials
    if (req.user.role === 'student') {
      filter.$or = [{ isPublic: true }, { course: { $in: req.user.enrolledCourses } }];
    }

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name avatar')
      .populate('course', 'title')
      .sort('-createdAt');

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete material
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await material.deleteOne();
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadMaterial, getMaterials, deleteMaterial };
