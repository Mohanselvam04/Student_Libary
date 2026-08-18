const Message = require('../models/Message');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const { getConversationMessages, saveMessageAndSync } = require('../utils/messageStore');

// Get or create conversation ID between two users
const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort('-createdAt');

    const conversationMap = new Map();
    const validMessages = messages.filter(msg => msg.sender && msg.receiver);

    validMessages.forEach((msg) => {
      const cid = msg.conversationId;
      if (!conversationMap.has(cid)) {
        const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        conversationMap.set(cid, {
          conversationId: cid,
          lastMessage: msg,
          otherUser,
          unread: msg.receiver._id.toString() === userId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiver._id.toString() === userId && !msg.isRead) {
        conversationMap.get(cid).unread++;
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = getConversationId(req.user._id.toString(), userId);
    
    // Fetch from messageStore (R2 or fallback to MongoDB)
    const messages = await getConversationMessages(conversationId);

    // Mark as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send message via REST (fallback, prefer socket)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const conversationId = getConversationId(req.user._id.toString(), receiverId);
    
    // Save message and sync using messageStore (which validates permissions)
    const message = await saveMessageAndSync(
      req.user._id.toString(),
      receiverId,
      content,
      conversationId
    );
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users to start a conversation with
const getUsers = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const users = await User.find({
        _id: { $ne: req.user._id },
        isActive: true,
        role: 'student'
      }).select('name email avatar role');
      return res.json(users);
    }

    const [students, instructors, admins] = await Promise.all([
      User.find({ _id: { $ne: req.user._id }, isActive: true }).select('name email avatar role').lean(),
      Instructor.find({ _id: { $ne: req.user._id }, isActive: true }).select('name email avatar role').lean(),
      Admin.find({ _id: { $ne: req.user._id }, isActive: true }).select('name email avatar role').lean()
    ]);

    const users = [
      ...students.map(u => ({ ...u, role: u.role || 'student' })),
      ...instructors.map(u => ({ ...u, role: u.role || 'instructor' })),
      ...admins.map(u => ({ ...u, role: u.role || 'admin' }))
    ];

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getUsers };
