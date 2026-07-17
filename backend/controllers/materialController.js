const Material = require('../models/Material');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/s3Client');

// Upload material
const uploadMaterial = async (req, res) => {
  try {
    let fileUrl, fileName, fileSize, type;

    if (req.file) {
      // 1. Determine file details
      const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const typeMap = { pdf: 'pdf', mp4: 'video', webm: 'video', jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', doc: 'doc', docx: 'doc', ppt: 'ppt', pptx: 'ppt', xls: 'xls', xlsx: 'xls' };
      type = typeMap[ext] || 'other';
      fileName = req.file.originalname;
      fileSize = req.file.size;

      // 2. Upload file to Cloudflare R2
      const r2Key = `materials/${Date.now()}-${req.file.originalname}`;
      
      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
        Key: r2Key,
        Body: fs.readFileSync(req.file.path),
        ContentType: req.file.mimetype,
      }));

      // 3. Delete local temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      // 4. Form public URL
      const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-yoursubdomain.r2.dev';
      fileUrl = `${publicUrl.replace(/\/$/, '')}/${r2Key}`;
    } else if (req.body.fileUrl) {
      // Handle client-side uploaded file (e.g. Firebase Storage)
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || 'Unnamed File';
      fileSize = req.body.fileSize || 0;
      
      const ext = path.extname(fileName).toLowerCase().replace('.', '');
      const typeMap = { pdf: 'pdf', mp4: 'video', webm: 'video', jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', doc: 'doc', docx: 'doc', ppt: 'ppt', pptx: 'ppt', xls: 'xls', xlsx: 'xls' };
      type = typeMap[ext] || 'other';
    } else {
      return res.status(400).json({ message: 'No file or file URL provided' });
    }

    const material = await Material.create({
      title: req.body.title || fileName,
      description: req.body.description || '',
      type,
      fileUrl,
      fileName,
      fileSize,
      course: req.body.courseId || null,
      uploadedBy: req.user._id,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
      tags: req.body.tags 
        ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) 
        : [],
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
    
    // Check authorization
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // 1. Delete file from local filesystem or Cloudflare R2
    if (material.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../uploads', path.basename(material.fileUrl));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete local file:', err);
        }
      }
    } else {
      // Cloudflare R2 deletion (non-blocking)
      const matchIndex = material.fileUrl.indexOf('materials/');
      if (matchIndex !== -1) {
        const r2Key = material.fileUrl.substring(matchIndex);
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const r2Client = require('../config/s3Client');
        
        r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
          Key: r2Key,
        })).catch(err => {
          console.error('Failed to delete file from Cloudflare R2:', err);
        });
      }
    }

    // 2. Remove from course if associated
    if (material.course) {
      await Course.findByIdAndUpdate(material.course, { $pull: { materials: material._id } });
    }

    // 3. Delete from database
    await material.deleteOne();
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadMaterial, getMaterials, deleteMaterial };
