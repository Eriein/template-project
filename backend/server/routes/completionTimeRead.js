//name of file: completionTimeRead.js

const express = require("express");
const router = express.Router();
const CompletionTime = require("../models/completionTimesModel");

// ==============================
// GET ALL
// GET /completion-times/getAll
// ==============================
router.get("/getAll", async (req, res) => {
  try {
    const times = await CompletionTime.find()
      .sort({ timeInSeconds: 1 }); // fastest first

    res.json(times);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

//To test in browser use:
//http://localhost:8081/api/completion-times/getAll