const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    username: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, required: true },
});

module.exports = mongoose.model("Score", scoreSchema);