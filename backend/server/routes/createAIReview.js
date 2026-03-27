const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const AIReviewCache = require('../models/AIReviewCache.js'); // Path to model

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// validates request fields and returns normalized values or an error descriptor
const validateReviewRequest = ({ review, omdbId, userId }) => {
  const normalizedOmdbId = typeof omdbId === 'string' ? omdbId.trim() : omdbId;
  const normalizedReview = typeof review === 'string' ? review.trim() : review;

  if (omdbId === undefined || !userId)
    return { error: 'Missing required fields.', required: ['omdbId', 'userId'], status: 400 };
  if (typeof omdbId !== 'string' || normalizedOmdbId.length === 0)
    return { error: 'omdbId must be a non-empty string.', receivedType: typeof omdbId, status: 400 };
  if (!mongoose.Types.ObjectId.isValid(userId))
    return { error: 'userId must be a valid ObjectId.', status: 400 };

  return { normalizedOmdbId, normalizedReview };
};

// pulls the generated text out of Gemini's nested response structure
const extractGeminiText = (responseData) => {
  const parts = responseData?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text).join('').trim();
};

// enforces the 50–1000 character limit on any review text
const isValidReviewLength = (text) => text.length >= 50 && text.length <= 1000;

const buildPrompt = ({ title, plot, actors }) => {
  const safeTitle = title || 'Unknown title';
  const safePlot = plot || 'Plot details are unavailable.';
  const safeActors = actors || 'Cast information is unavailable.';

  return [
    `Write a short, engaging movie review. Keep it under 1000 characters total.`,
    `Avoid spoilers beyond what is provided.`,
    `Movie Title: ${safeTitle}`,
    `Plot: ${safePlot}`,
    `Cast: ${safeActors}`,
    `Review:`
  ].join('\n');
};

const fetchMovieDetails = async (omdbId) => {
  if (!process.env.OMDB_API_KEY) {
    return { error: 'Configuration error.', details: ['OMDB_API_KEY is missing.'] };
  }

  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: process.env.OMDB_API_KEY,
      i: omdbId,
      plot: 'full'
    },
    timeout: 8000
  });

  if (!response.data || typeof response.data !== 'object') {
    return { error: 'Invalid response from movie service.' };
  }

  if (response.data.Response === 'False') {
    return { error: 'Movie not found.', details: [response.data.Error].filter(Boolean) };
  }

  return {
    title: response.data.Title,
    plot: response.data.Plot,
    actors: response.data.Actors
  };
};

router.post('/reviews', async (req, res) => {
  const validation = validateReviewRequest(req.body);
  if (validation.error) {
    const { status, error, ...rest } = validation;
    return res.status(status).json({ error, ...rest });
  }

  const { normalizedOmdbId, normalizedReview } = validation;
  const { userId } = req.body;

  try {
    // Rate Limit Check: Cooldown period (30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentReview = await AIReviewCache.findOne({
      userId: userId,
      date: { $gte: thirtySecondsAgo }
    });

    if (recentReview) {
      return res.status(429).json({ error: 'Please wait 30 seconds before posting again.' });
    }

    // Daily Limit Check: Max 3 reviews in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyReviewCount = await AIReviewCache.countDocuments({
      userId: userId,
      date: { $gte: twentyFourHoursAgo }
    });
    // disable for test
    // if (dailyReviewCount >= 3) {
    //   return res.status(429).json({
    //     error: 'Daily review limit reached. Please come back tomorrow.'
    //   });
    // }

    let finalReview = normalizedReview;

    if (finalReview) {
      if (typeof finalReview !== 'string') {
        return res.status(400).json({ error: 'review must be a string.' });
      }

      if (finalReview.length < 50 || finalReview.length > 1000) {
        return res.status(400).json({ error: 'Review must be between 50 and 1000 characters.' });
      }
    } else {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'Configuration error.',
          details: ['GEMINI_API_KEY is missing.']
        });
      }

      const movieDetails = await fetchMovieDetails(normalizedOmdbId);
      if (movieDetails.error) {
        const status = movieDetails.error === 'Movie not found.' ? 404 : 502;
        return res.status(status).json(movieDetails);
      }

      const prompt = buildPrompt(movieDetails);
      const geminiResponse = await axios.post(
        GEMINI_ENDPOINT,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          timeout: 15000
        }
      );

      finalReview = extractGeminiText(geminiResponse.data);

      if (!finalReview)
        return res.status(502).json({ error: 'AI review generation failed.' });
      if (!isValidReviewLength(finalReview))
        return res.status(502).json({ error: 'AI review length was invalid.' });
    }

    // 6. Create and save the new review
    const newReview = new AIReviewCache({
      review: finalReview,
      omdbId: normalizedOmdbId,
      userId
    });

    await newReview.save();
    
    // Send back the newly created resource
    res.status(201).json({ review: newReview });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed.',
        details: Object.values(err.errors).map((fieldError) => fieldError.message)
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({
        error: `Invalid value for ${err.path}.`,
        value: err.value
      });
    }
    console.error('createAIReview error:', err);
    res.status(500).json({
      error: 'Unexpected server error.',
      details: err.message
    });
  }
});

module.exports = router;
