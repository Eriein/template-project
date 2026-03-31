const express = require('express');
const mongoose = require('mongoose');
const AIReviewCache = require('../models/AIReviewCache.js');

const router = express.Router();

router.delete('/reviews/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.query;

  if (!reviewId || !userId) {
    return res.status(400).json({
      error: 'reviewId param and userId query parameter are required.'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'reviewId must be a valid ObjectId.' });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'userId must be a valid ObjectId.' });
  }

  try {
    const deletedReview = await AIReviewCache.findOneAndDelete({
      _id: reviewId,
      userId
    });

    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.status(200).json({ deleted: true, reviewId });
  } catch (err) {
    console.error('deleteAIReview error:', err);
    return res.status(500).json({
      error: 'Unexpected server error.',
      details: err.message
    });
  }
});

module.exports = router;
