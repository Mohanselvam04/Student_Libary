const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI Chat - tutoring assistant
const aiChat = async (req, res) => {
  try {
    const { messages, context } = req.body;

    const systemPrompt = `You are an expert LMS learning assistant and tutor. Help students understand course materials, answer questions, explain concepts clearly, and guide them through their learning journey. 
    ${context ? `Context: The student is studying ${context}.` : ''}
    Be encouraging, clear, and provide examples when helpful. Break down complex topics into easy-to-understand parts.`;

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
    if (err.code === 'invalid_api_key') {
      return res.status(400).json({ message: 'Invalid OpenAI API key. Please configure a valid key.' });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = { aiChat };
