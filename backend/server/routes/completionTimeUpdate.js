//name of file: completionTimeUpdate.js

const express = require("express");
const router = express.Router();
const CompletionTime = require("../models/completionTimesModel");

// PUT /api/completion-times/update/:id
// ==============================
router.put("/update/:id", async (req, res) => {
    try {
        const updatedTime = await CompletionTime.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTime) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(updatedTime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;