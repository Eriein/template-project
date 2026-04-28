const mongoose = require("mongoose");

//plot schema/model
const AIReviewCache= new mongoose.Schema(
  {
    review: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1000,
        label: "review"
    },
    omdbId: {
      type: String,
      required: true,
      label: "omdbId"
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
    }
  },
  { collection: "AIReviewCache" }
);

AIReviewCache.index({ userId: 1 });
AIReviewCache.index({ date: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('AIReviewCache', AIReviewCache);
