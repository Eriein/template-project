const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// GET all users with zip codes
// Optional query: ?zipCode=01970
router.get("/users/zipcodes", async (req, res) => {
    try {
        const { zipCode } = req.query;

        // Build filter
        let filter = {};

        // If specific zipCode is provided
        if (zipCode) {
            // Validate zip format (5-digit or ZIP+4)
            const zipRegex = /^\d{5}(-\d{4})?$/;

            if (!zipRegex.test(zipCode)) {
                return res.status(400).json({
                    error: "Invalid zip code format"
                });
            }

            filter.zipCode = zipCode;
        } else {
            // Only return users that actually have a zipCode set
            filter.zipCode = { $ne: "" };
        }

        const users = await User.find(filter)
            .select("username email zipCode date")
            .sort({ date: -1 });

        return res.status(200).json({
            count: users.length,
            data: users
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
});

module.exports = router;