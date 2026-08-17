const Message = require('../models/Message');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const r2Client = require('../configs/s3Client');
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const MAX_CONVERSATION_MESSAGES = 50;

// Helper to get user by ID from any of the three collections/models
async function findUserById(id) {
  let user = await User.findById(id);
  if (user) return user;
  user = await Instructor.findById(id);
  if (user) return user;
  user = await Admin.findById(id);
  return user;
}

// Helper to map user role to mongoose model name
function getModelNameByRole(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'instructor') return 'Instructor';
  return 'User'; // default or student
}

// Fetch messages from R2 or fallback to MongoDB
async function getConversationMessages(conversationId) {
  if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
        Key: `messages/${conversationId}.json`,
      });
      const response = await r2Client.send(command);
      const strData = await response.Body.transformToString();
      const messages = JSON.parse(strData);
      return messages;
    } catch (err) {
      if (err.name !== 'NoSuchKey') {
        console.error('Error fetching messages from R2:', err);
      }
    }
  }
  
  // Fallback to MongoDB
  const messages = await Message.find({ conversationId })
    .populate('sender', 'name avatar')
    .sort('createdAt');
  return messages.filter(msg => msg.sender);
}

// Save message to R2 and clean up old messages
async function saveMessageAndSync(senderId, receiverId, content, conversationId) {
  // 1. Permission check
  const sender = await findUserById(senderId);
  const receiver = await findUserById(receiverId);
  if (!sender || !receiver) {
    throw new Error('User not found');
  }

  // Student can only chat with student
  if (sender.role === 'student' && receiver.role !== 'student') {
    throw new Error('Students are only allowed to chat with other students');
  }

  // 2. Create message in MongoDB
  const message = await Message.create({
    sender: senderId,
    senderModel: getModelNameByRole(sender.role),
    receiver: receiverId,
    receiverModel: getModelNameByRole(receiver.role),
    content,
    conversationId,
  });
  await message.populate('sender', 'name avatar');

  // 3. Save to Cloudflare R2
  if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
      // Get existing messages
      let allMessages = [];
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
          Key: `messages/${conversationId}.json`,
        });
        const response = await r2Client.send(command);
        const strData = await response.Body.transformToString();
        allMessages = JSON.parse(strData);
      } catch (err) {
        if (err.name !== 'NoSuchKey') {
          console.error('Error downloading conversation from R2:', err);
        }
        // If not in R2, load from Mongo as fallback
        allMessages = await Message.find({ conversationId })
          .populate('sender', 'name avatar')
          .sort('createdAt');
      }

      const formattedMessage = message.toJSON();
      
      // If messages already contain this ID, don't duplicate (in case of double triggers)
      if (!allMessages.some(m => m.id === formattedMessage.id)) {
        allMessages.push(formattedMessage);
      }

      // Check storage limits & auto remove old messages if storage limit (MAX_CONVERSATION_MESSAGES) is reached
      if (allMessages.length > MAX_CONVERSATION_MESSAGES) {
        console.log(`Storage capacity reached for conversation ${conversationId}. Auto-removing ${allMessages.length - MAX_CONVERSATION_MESSAGES} oldest messages.`);
        allMessages = allMessages.slice(allMessages.length - MAX_CONVERSATION_MESSAGES);

        // Cleanup in MongoDB as well to keep DB storage empty of old records
        const messagesToKeep = await Message.find({ conversationId })
          .sort({ createdAt: -1 })
          .limit(MAX_CONVERSATION_MESSAGES)
          .select('_id');
        const keepIds = messagesToKeep.map(m => m._id);
        await Message.deleteMany({ conversationId, _id: { $nin: keepIds } });
      }

      // Upload updated JSON to R2
      const putCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'student-lib',
        Key: `messages/${conversationId}.json`,
        Body: JSON.stringify(allMessages),
        ContentType: 'application/json',
      });
      await r2Client.send(putCommand);
    } catch (err) {
      console.error('R2 message sync failed:', err);
    }
  }

  return message;
}

module.exports = {
  getConversationMessages,
  saveMessageAndSync,
  MAX_CONVERSATION_MESSAGES
};
