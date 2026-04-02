const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // adds createdAt / updatedAt
    }
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

module.exports = Flashcard;