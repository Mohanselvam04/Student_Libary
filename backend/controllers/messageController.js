const Message = require('../models/Message');
const User = require('../models/User');

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
    messages.forEach((msg) => {
      const cid = msg.conversationId;
      if (!conversationMap.has(cid)) {
        conversationMap.set(cid, {
          conversationId: cid,
          lastMessage: msg,
          otherUser: msg.sender._id.toString() === userId ? msg.receiver : msg.sender,
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
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

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
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      conversationId,
    });
    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users to start a conversation with
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true }).select('name avatar role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getUsers };
