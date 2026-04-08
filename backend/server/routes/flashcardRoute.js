//flashcards

const express = require("express");
const router = express.Router();
const Flashcard = require("../models/flashcardModel");

// GET /api/flashcards - Returns 4 random flashcards
router.get("/", async (req, res) => {
    try {
        const flashcards = await Flashcard.aggregate([
            { $sample: { size: 4 } }
        ]);
        res.json(flashcards);
    } catch (err) {
        console.error("GET /flashcards error:", err);
        res.status(500).json({ error: "Failed to fetch flashcards" });
    }
});

// POST /api/flashcards
router.post("/", async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "title and description are required" });
    }
    try {
        const newCard = await Flashcard.create({ title, description });
        res.status(201).json(newCard);
    } catch (err) {
        console.error("POST /flashcards error:", err);
        res.status(500).json({ error: "Failed to create flashcard" });
    }
});

// PUT /api/flashcards/:id
router.put("/:id", async (req, res) => {
    const { title, description } = req.body;
    try {
        const flashcard = await Flashcard.findByIdAndUpdate(
            req.params.id,
            { ...(title && { title }), ...(description && { description }) },
            { new: true, runValidators: true }
        );
        if (!flashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
        }
        res.json(flashcard);
    } catch (err) {
        console.error("PUT /flashcards/:id error:", err);
        res.status(500).json({ error: "Failed to update flashcard" });
    }
});

// DELETE ALL /api/flashcards
router.delete("/", async (req, res) => {
    try {
        await Flashcard.deleteMany({});
        res.json({ message: "All flashcards deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete all flashcards" });
    }
});

module.exports = router;