const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Flashcard', flashcardSchema);