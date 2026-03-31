const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');

// GET all flashcards — used by fetchFlashcards() in your frontend
router.get('/', async (req, res) => {
    try {
        const flashcards = await Flashcard.find().sort({ id: 1 });
        res.json(flashcards);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
});

// GET a single flashcard by id
router.get('/:id', async (req, res) => {
    try {
        const card = await Flashcard.findOne({ id: req.params.id });
        if (!card) return res.status(404).json({ error: 'Not found' });
        res.json(card);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch flashcard' });
    }
});

// POST — create a new flashcard
router.post('/', async (req, res) => {
    try {
        const card = new Flashcard(req.body);
        await card.save();
        res.status(201).json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT — update a flashcard by id
router.put('/:id', async (req, res) => {
    try {
        const card = await Flashcard.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!card) return res.status(404).json({ error: 'Not found' });
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE — remove a flashcard by id
router.delete('/:id', async (req, res) => {
    try {
        const card = await Flashcard.findOneAndDelete({ id: req.params.id });
        if (!card) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

module.exports = router;