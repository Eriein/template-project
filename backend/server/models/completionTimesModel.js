const mongoose = require("mongoose");

const completionTimesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // matches the 'users' mongoose.model 
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
    collection: "completionTimes", // Name of the collection
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model(
  "completionTimes",
  completionTimesSchema
);