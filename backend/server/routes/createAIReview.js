const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AIReviewCache = require('../models/AIReviewCache.js'); // Path to model

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

    // 3. Validation for cache miss (new entry required)
    if (!review) {
      return res.status(400).json({
        error: 'review is required when no cached review exists.'
      });
    }

    if (typeof review !== 'string') {
      return res.status(400).json({ error: 'review must be a string.' });
    }

    if (normalizedReview.length < 50 || normalizedReview.length > 1000) {
      return res.status(400).send("Review must be between 50 and 1000 characters.");
    }

    // 4. Rate Limit Check: Cooldown period (30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentReview = await AIReviewCache.findOne({
      userId: userId,
      date: { $gte: thirtySecondsAgo }
    });

    if (recentReview) {
      return res.status(429).send("Please wait 30 seconds before posting again.");
    }

    // 5. Daily Limit Check: Max 3 reviews in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyReviewCount = await AIReviewCache.countDocuments({
      userId: userId,
      date: { $gte: twentyFourHoursAgo }
    });
    // To do add limit later

    // 6. Create and save the new review
    const newReview = new AIReviewCache({
      review: normalizedReview,
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
