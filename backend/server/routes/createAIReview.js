const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const AIReviewCache = require('../models/AIReviewCache.js'); // Path to model

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const buildPrompt = ({ title, plot, actors }) => {
  const safeTitle = title || 'Unknown title';
  const safePlot = plot || 'Plot details are unavailable.';
  const safeActors = actors || 'Cast information is unavailable.';

  return [
    `Write a 500-1000 character, engaging movie review (2-3 short paragraphs).`,
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
  // 1. Get data from the request body 
  const { review, omdbId, userId } = req.body;
  const normalizedReview = typeof review === 'string' ? review.trim() : review;
  const normalizedOmdbId = typeof omdbId === 'string' ? omdbId.trim() : omdbId;

  if (omdbId === undefined || !userId) {
    return res.status(400).json({
      error: 'Missing required fields.',
      required: ['omdbId', 'userId']
    });
  }

  if (typeof omdbId !== 'string' || normalizedOmdbId.length === 0) {
    return res.status(400).json({
      error: 'omdbId must be a non-empty string.',
      receivedType: typeof omdbId
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'userId must be a valid ObjectId.' });
  }

  try {
    // 2. Cache hit check: same user + movie
    const existingReview = await AIReviewCache.findOne({
      userId: userId,
      omdbId: normalizedOmdbId
    });

    if (existingReview) {
      return res.status(200).json({
        cached: true,
        review: existingReview
      });
    }

    // 3. Rate Limit Check: Cooldown period (30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentReview = await AIReviewCache.findOne({
      userId: userId,
      date: { $gte: thirtySecondsAgo }
    });

    if (recentReview) {
      return res.status(429).json({ error: 'Please wait 30 seconds before posting again.' });
    }

    // 4. Daily Limit Check: Max 3 reviews in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyReviewCount = await AIReviewCache.countDocuments({
      userId: userId,
      date: { $gte: twentyFourHoursAgo }
    });
    if (dailyReviewCount >= 3) {
      return res.status(429).json({
        error: 'Daily review limit reached. Please come back tomorrow.'
      });
    }

    // 5. Decide review source (client-provided or AI generated)
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

      const textParts = geminiResponse.data?.candidates?.[0]?.content?.parts || [];
      finalReview = textParts.map((part) => part.text).join('').trim();

      if (!finalReview) {
        return res.status(502).json({ error: 'AI review generation failed.' });
      }

      if (finalReview.length < 50 || finalReview.length > 1000) {
        return res.status(502).json({ error: 'AI review length was invalid.' });
      }
    }

    // 6. Create and save the new review
    const newReview = new AIReviewCache({
      review: finalReview,
      omdbId: normalizedOmdbId,
      userId
    });

    await newReview.save();
    
    // Send back the newly created resource
    res.status(201).json({
      cached: false,
      review: newReview
    });

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
    // avoids race condition 
    if (err.code === 11000) {
      const cachedReview = await AIReviewCache.findOne({
        userId: userId,
        omdbId: normalizedOmdbId
      });

      return res.status(200).json({
        cached: true,
        review: cachedReview
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
