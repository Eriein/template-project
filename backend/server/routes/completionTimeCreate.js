//name of file: completionTimeCreate.js

const express = require("express");
const router = express.Router();
const CompletionTime = require("../models/completionTimesModel");

// POST /api/completion-times/create
// ==============================
router.post("/create", async (req, res) => {
    try {
        const { user, timeInSeconds } = req.body;

        const newTime = await CompletionTime.create({
            user,
            timeInSeconds,
        });

        res.status(201).json(newTime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;