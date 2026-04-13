const express = require('express');
const axios = require('axios');
const router = express.Router();

// IMDb Top 10 by rating — stable, rarely changes
const TOP_RATED_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0468569', // The Dark Knight
  'tt0071562', // The Godfather Part II
  'tt0050083', // 12 Angry Men
  'tt0108052', // Schindler's List
  'tt0167260', // The Lord of the Rings: The Return of the King
  'tt0110912', // Pulp Fiction
  'tt0060196', // The Good, the Bad and the Ugly
  'tt1375666', // Inception
];

router.get('/top-rated', async (req, res) => {
  if (!process.env.OMDB_API_KEY) {
    return res.status(500).json({ error: 'Configuration error.', details: ['OMDB_API_KEY is missing.'] });
  }

  try {
    const fetches = TOP_RATED_IDS.map((id) =>
      axios.get('http://www.omdbapi.com/', {
        params: { apikey: process.env.OMDB_API_KEY, i: id, plot: 'short' },
        timeout: 8000,
      })
    );

    const responses = await Promise.all(fetches);

    const results = responses
      .map((r) => r.data)
      .filter((movie) => movie.Response === 'True' && movie.Poster && movie.Poster !== 'N/A')
      .map((movie) => ({
        imdbId: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        rating: movie.imdbRating,
      }));

    res.json({ results });
  } catch (err) {
    console.error('movieTopRated fetch error', err.message);
    const isTimeout = err.code === 'ECONNABORTED';
    if (isTimeout) return res.status(504).json({ error: 'Movie service timed out.' });
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;