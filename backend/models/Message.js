const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['User', 'Instructor', 'Admin'], default: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
  receiverModel: { type: String, required: true, enum: ['User', 'Instructor', 'Admin'], default: 'User' },
  content: { type: String, required: true },
  conversationId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: { virtuals: true },
});

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
