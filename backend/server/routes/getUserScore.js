const express = require("express");
const router = express.Router();
const Score = require("../models/scores");

// POST /scores
router.post("/", async (req, res) => {
    try {
        const { username, score, date } = req.body;

        if (username == null || score == null || date == null) {
            return res
                .status(400)
                .json({ error: "username, score, and date are required" });
        }

        const scoreNum = Number(score);
        if (Number.isNaN(scoreNum)) {
            return res.status(400).json({ error: "score must be a number" });
        }

        const dateObj = new Date(date);
        if (Number.isNaN(dateObj.getTime())) {
            return res.status(400).json({ error: "date must be a valid date" });
        }

        const doc = await Score.create({
            username,
            score: scoreNum,
            date: dateObj,
        });

        return res.status(201).json(doc);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// GET /scores (sorted newest first)
router.get("/", async (req, res) => {
    try {
        const docs = await Score.find().sort({ date: -1 });
        return res.json(docs);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// GET /scores/:id
router.get("/:id", async (req, res) => {
    try {
        const doc = await Score.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: "Not found" });
        return res.json(doc);
    } catch (err) {
        return res.status(400).json({ error: "Invalid id" });
    }
});

module.exports = router;