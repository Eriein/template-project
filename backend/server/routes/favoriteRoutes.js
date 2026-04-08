const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Add a favorite cinema
router.post('/', async (req, res) => {
    try {
        const { userId, cinemaId, cinemaName, address } = req.body;

        const newFavorite = new Favorite({
            userId,
            cinemaId,
            cinemaName,
            address
        });

        const savedFavorite = await newFavorite.save();
        res.status(201).json(savedFavorite);
    } catch (error) {
        console.error('Error saving favorite:', error);
        res.status(500).json({ error: 'Failed to save favorite cinema' });
    }
});

// Get all favorite cinemas for one user
router.get('/:userId', async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId });
        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to get favorite cinemas' });
    }
});

router.delete('/:userId/:cinemaId', async (req, res) => {
    try {
        const { userId, cinemaId } = req.params;

        // 🔍 查找并删除
        const deleted = await Favorite.findOneAndDelete({
            userId: userId,
            cinemaId: cinemaId
        });

        // ❗ 如果没找到
        if (!deleted) {
            return res.status(404).json({
                error: "Favorite not found"
            });
        }

        res.status(200).json({
            message: "Removed from favorites",
            deleted: deleted
        });

    } catch (err) {
        console.error("Delete favorite error:", err);
        res.status(500).json({
            error: "Failed to delete favorite"
        });
    }
});

module.exports = router;