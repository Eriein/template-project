const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

// Data shaping functions are kept separate from the network calls so each
// piece of logic — poster filtering, URL building, year extraction — can be
// verified independently without running a server or mocking TMDB.
const hasTmdbPoster = (movie) => Boolean(movie.poster_path);

const formatRating = (voteAverage) =>
  voteAverage != null ? voteAverage.toFixed(1) : null;

const extractYear = (releaseDate) =>
  releaseDate ? releaseDate.slice(0, 4) : '';

const toPosterUrl = (posterPath) => `${TMDB_IMG}${posterPath}`;

const toMovieShape = (movie, imdbId) => ({
  imdbId,
  title: movie.title,
  year: extractYear(movie.release_date),
  poster: toPosterUrl(movie.poster_path),
  rating: formatRating(movie.vote_average),
});

const buildTopRatedResponse = (candidates, imdbIds) => ({
  results: candidates
    .map((movie, i) => toMovieShape(movie, imdbIds[i]))
    .filter((m) => m.imdbId),
});

// Everything below makes real network calls. The handler only fetches data
// and passes it to the shaping functions above — no transformation logic here.
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
    const listRes = await tmdbGet('/movie/top_rated', { page: 1 }, apiKey);

    const candidates = (listRes.data.results || [])
      .filter(hasTmdbPoster)
      .slice(0, 10);

    const imdbIds = await Promise.all(
      candidates.map((m) =>
        tmdbGet(`/movie/${m.id}/external_ids`, {}, apiKey)
          .then((r) => r.data.imdb_id)
          .catch(() => null)
      )
    );

    res.json(buildTopRatedResponse(candidates, imdbIds));
  } catch (err) {
    console.error('movieTopRated fetch error', err.message);
    if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'Movie service timed out.' });
    if (err.response?.status === 401) return res.status(502).json({ error: 'Invalid TMDB API key.' });
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
module.exports.hasTmdbPoster = hasTmdbPoster;
module.exports.formatRating = formatRating;
module.exports.extractYear = extractYear;
module.exports.toPosterUrl = toPosterUrl;
module.exports.toMovieShape = toMovieShape;
module.exports.buildTopRatedResponse = buildTopRatedResponse;
