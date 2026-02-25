const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AIReviewCache = require('../models/AIReviewCache'); // Path to model

router.post('/reviews', async (req, res) => {
  // 1. Get data from the request body 
  const { review, omdbId, userId } = req.body;
  const normalizedReview = typeof review === 'string' ? review.trim() : review;
  const normalizedOmdbId = typeof omdbId === 'string' ? omdbId.trim() : omdbId;

  if (!review || omdbId === undefined || !userId) {
    return res.status(400).json({
      error: 'Missing required fields.',
      required: ['review', 'omdbId', 'userId']
    });
  }

  if (typeof review !== 'string') {
    return res.status(400).json({ error: 'review must be a string.' });
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

  // 2. Basic Validation: Check review length
  if (normalizedReview.length < 50 || normalizedReview.length > 1000) {
    return res.status(400).send("Review must be between 50 and 1000 characters.");
  }

  try {
    // 3. Duplicate check: same user + movie + review text
    const existingReview = await AIReviewCache.findOne({
      userId: userId,
      omdbId: normalizedOmdbId,
      review: normalizedReview
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'You already created this review.',
        reviewId: existingReview._id
      });
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

    if (dailyReviewCount >= 3) {
      return res.status(429).send("Daily limit reached.");
    }

    // 6. Create and save the new review
    const newReview = new AIReviewCache({
      review: normalizedReview,
      omdbId: normalizedOmdbId,
      userId
    });

    await newReview.save();
    
    // Send back the newly created resource
    res.status(201).json(newReview);

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

    if (err.code === 11000) {
      return res.status(409).json({
        error: 'You already created this review.'
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
