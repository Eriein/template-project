const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

const tmdbGet = (path, params, apiKey) =>
  axios.get(`${TMDB_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    params: { language: 'en-US', ...params },
    timeout: 8000,
  });

router.get('/top-rated', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuration error.', details: ['TMDB_API_KEY is missing.'] });
  }

  try {
    // Step 1: fetch top-rated list (single call)
    const listRes = await tmdbGet('/movie/top_rated', { page: 1 }, apiKey);

    const candidates = (listRes.data.results || [])
      .filter((m) => m.poster_path)
      .slice(0, 10);

    // Step 2: fetch IMDb IDs in parallel (needed for OMDB-based detail page)
    const detailFetches = candidates.map((m) =>
      tmdbGet(`/movie/${m.id}/external_ids`, {}, apiKey)
        .then((r) => r.data.imdb_id)
        .catch(() => null)
    );

    const imdbIds = await Promise.all(detailFetches);

    const results = candidates
      .map((movie, i) => ({
        imdbId: imdbIds[i],
        title: movie.title,
        year: movie.release_date?.slice(0, 4) || '',
        poster: `${TMDB_IMG}${movie.poster_path}`,
        rating: movie.vote_average?.toFixed(1),
      }))
      .filter((m) => m.imdbId); // drop any where IMDb ID lookup failed

    res.json({ results });
  } catch (err) {
    console.error('movieTopRated fetch error', err.message);
    if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'Movie service timed out.' });
    if (err.response?.status === 401) return res.status(502).json({ error: 'Invalid TMDB API key.' });
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
