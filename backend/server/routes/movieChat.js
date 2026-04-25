const express = require('express');
const router = express.Router();
const axios = require('axios');
const z = require('zod');
const { GEMINI_ENDPOINT, extractGeminiText, fetchMovieDetails } = require('../utilities/geminiUtils');

const messageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string()
});

const chatSchema = z.object({
  imdbId: z.string().min(1, 'imdbId must be a non-empty string'),
  userId: z.string().min(1, 'userId is required'),
  messages: z.array(messageSchema).min(1, 'messages must not be empty')
}).superRefine((data, ctx) => {
  const lastUserMsg = [...data.messages].reverse().find((m) => m.role === 'user');
  if (lastUserMsg && lastUserMsg.content.length > 500) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 500,
      type: 'string',
      inclusive: true,
      message: 'Latest user message must not exceed 500 characters',
      path: ['messages']
    });
  }
});

const buildSystemPrompt = ({ title, year, plot, actors }) =>
  `You are a movie expert. The user is asking about ${title || 'this movie'} (${year || 'year unknown'}). ` +
  `Plot: ${plot || 'Plot unavailable.'}. Cast: ${actors || 'Cast unavailable.'}. ` +
  `Rules: Answer questions about this movie only — if asked about unrelated topics, redirect back. ` +
  `Keep every response to 2-3 sentences maximum. Write like a knowledgeable friend, not an encyclopedia. ` +
  `No bullet points, no numbered lists, no bold or markdown formatting. Lead with the most interesting insight.`;

router.post('/chat', async (req, res) => {
  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: result.error.errors.map((e) => e.message)
    });
  }

  const { imdbId, messages } = result.data;
  const trimmedMessages = messages.slice(-20);

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Configuration error.', details: ['GEMINI_API_KEY is missing.'] });
  }

  try {
    const movieDetails = await fetchMovieDetails(imdbId);
    if (movieDetails.error) {
      return res.status(502).json({ error: movieDetails.error });
    }

    const systemPrompt = buildSystemPrompt(movieDetails);
    const contents = trimmedMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const geminiResponse = await axios.post(
      GEMINI_ENDPOINT,
      {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        timeout: 15000
      }
    );

    const reply = extractGeminiText(geminiResponse.data);
    if (!reply) {
      return res.status(502).json({ error: 'Chat response generation failed.' });
    }

    res.json({ reply });
  } catch (err) {
    if (err.response?.status === 503) {
      return res.status(503).json({ error: 'Gemini is temporarily unavailable. Please try again in a moment.' });
    }
    if (err.response) {
      const geminiMsg = err.response.data?.error?.message;
      return res.status(502).json({ error: geminiMsg || 'Gemini returned an unexpected error.' });
    }
    console.error('movieChat error:', err);
    res.status(500).json({ error: 'Unexpected server error.', details: err.message });
  }
});

module.exports = router;
module.exports.buildSystemPrompt = buildSystemPrompt;