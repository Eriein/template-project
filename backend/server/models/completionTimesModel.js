const mongoose = require("mongoose");

const completionTimesSchema = new mongoose.Schema(
  {
    user: {
      type: String, // ✅ username instead of ObjectId
      required: true,
    },
    timeInSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    collection: "completionTimes",
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "completionTimes",
  completionTimesSchema
);