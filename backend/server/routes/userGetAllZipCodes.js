const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

router.get("/users/zipcodes", async (req, res) => {
    try {
        const users = await User.find().select("username email zipCode date");
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;