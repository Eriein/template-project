//name of file: completionTimeDelete.js

const express = require("express");
const router = express.Router();
const CompletionTime = require("../models/completionTimesModel");

// DELETE /api/completion-times/delete/:id
// ==============================
router.delete("/delete/:id", async (req, res) => {
    try {
        const deletedTime = await CompletionTime.findByIdAndDelete(req.params.id);

        if (!deletedTime) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;