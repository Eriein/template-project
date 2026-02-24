const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

router.put("/users/:id/zipcode", async (req, res) => {
    try {
        const { zipCode } = req.body;

        if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
            return res.status(400).json({ error: "Invalid zip code" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { zipCode },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(updatedUser);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;