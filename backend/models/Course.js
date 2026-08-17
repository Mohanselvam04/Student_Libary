const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  level: { type: String, default: '' },
  price: { type: Number, default: 0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, refPath: 'instructorModel', required: true },
  instructorModel: { type: String, required: true, enum: ['User', 'Instructor', 'Admin'], default: 'User' },
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: false },
  backgroundImage: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret.__v;
    },
  },
  toObject: { virtuals: true },
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
