const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['pdf', 'video', 'doc', 'image', 'link', 'other'], required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
