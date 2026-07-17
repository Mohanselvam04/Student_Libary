const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'instructor' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
}, {
  timestamps: true,
  collection: 'instructors',
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret.__v;
      delete ret.password;
    },
  },
  toObject: { virtuals: true },
});

instructorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

instructorSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.models.Instructor || mongoose.model('Instructor', instructorSchema);
