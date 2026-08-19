const OpenAI = require('openai');

let openai;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && !process.env.OPENAI_API_KEY.startsWith('sk-your')) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (err) {
  console.error('Failed to initialize OpenAI client:', err.message);
}

// AI Chat - tutoring assistant
const aiChat = async (req, res) => {
  try {
    const { messages, context } = req.body;

    const systemPrompt = `You are an expert LMS learning assistant and tutor. Help students understand course materials, answer questions, explain concepts clearly, and guide them through their learning journey. 
    ${context ? `Context: The student is studying ${context}.` : ''}
    Be encouraging, clear, and provide examples when helpful. Break down complex topics into easy-to-understand parts.`;

    if (!openai) {
      // Mock / Demo reply when OpenAI API key is not configured
      const userMessage = messages[messages.length - 1]?.content || '';
      let reply = `👋 Hi! I'm your AI tutor. (Running in Demo Mode: please configure a valid \`OPENAI_API_KEY\` in your \`backend/.env\` file to enable live AI responses).\n\nHere is a demo response to your query: "${userMessage}".\n\nI can help you understand your courses, summarize documents, and explain complex concepts once the API key is set up!`;
      
      // Add simple keyword responses to make it feel alive!
      const lowerMsg = userMessage.toLowerCase();
      if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        reply = `👋 Hello! I am your AI Study Tutor. How can I help you with your learning goals today?`;
      } else if (lowerMsg.includes('react') || lowerMsg.includes('javascript') || lowerMsg.includes('web')) {
        reply = `💻 Web development is exciting! React is a popular component-based frontend library. You can build interactive user interfaces by managing component state and props. What concepts would you like to explore?`;
      } else if (lowerMsg.includes('database') || lowerMsg.includes('mongodb')) {
        reply = `🗄️ Databases store and manage your application's data. MongoDB is a NoSQL document database, storing data in JSON-like BSON documents. It's highly scalable and flexible!`;
      }
      
      return res.json({ reply });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    if (err.code === 'invalid_api_key' || err.status === 401) {
      return res.status(400).json({ message: 'Invalid OpenAI API key. Please configure a valid key.' });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = { aiChat };

