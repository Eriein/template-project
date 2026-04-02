const express = require("express");
const router = express.Router();
const Flashcard = require("../models/flashcardModel");


// GET /api/flashcards
// Returns all flashcards

router.get("/", async (req, res) => {
    try {
        const flashcards = await Flashcard.find();
        res.json(flashcards);
    } catch (err) {
        console.error("GET /flashcards error:", err);
        res.status(500).json({ error: "Failed to fetch flashcards" });
    }
});


// GET /api/flashcards/:id
// Returns a single flashcard by ID

router.get("/:id", async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        if (!flashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
        }
        res.json(flashcard);
    } catch (err) {
        console.error("GET /flashcards/:id error:", err);
        res.status(500).json({ error: "Failed to fetch flashcard" });
    }
});


// POST /api/flashcards
// Creates a new flashcard

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


// Updates an existing flashcard


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


// DELETE /api/flashcards/:id
// Deletes a flashcard by ID

router.delete("/:id", async (req, res) => {
    try {
        const flashcard = await Flashcard.findByIdAndDelete(req.params.id);

        if (!flashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        res.json({ message: `Flashcard ${req.params.id} deleted successfully` });
    } catch (err) {
        console.error("DELETE /flashcards/:id error:", err);
        res.status(500).json({ error: "Failed to delete flashcard" });
    }
});

module.exports = router;