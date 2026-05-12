const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    conversationId: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    messageType: { type: String, enum: ['text', 'file'], default: 'text' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
