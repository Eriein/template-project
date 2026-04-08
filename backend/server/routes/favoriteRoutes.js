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

module.exports = router;