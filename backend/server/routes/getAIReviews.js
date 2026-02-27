const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AIReviewCache = require('../models/AIReviewCache');

router.get('/reviews', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'userId must be a valid ObjectId.' });
    }

    const foundReviews = await AIReviewCache.find({ userId }).sort({ date: -1 });

    if (foundReviews.length === 0) {
      return res.status(404).send("No reviews were found for this user.");
    }

    res.status(200).json(foundReviews);
  } catch (err) {
    res.status(500).send("The records could not be retrieved because of a connection failure.");
  }
});

module.exports = router;
