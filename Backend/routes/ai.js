const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

router.post('/generate', async (req, res) => {
  try {
    const { topic, category } = req.body;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Write a blog post about: ${topic}. Category: ${category || 'General'}. 
          Format it with a title, introduction, 3 main points, and a conclusion. 
          Use HTML tags like <h2>, <p>, <ul>, <li> for formatting.`
        }
      ]
    });

    const generatedContent = message.content[0].text;
    res.json({ content: generatedContent });

  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;