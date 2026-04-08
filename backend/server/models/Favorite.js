const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    cinemaId: {
        type: String,
        required: true
    },
    cinemaName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorite', favoriteSchema);