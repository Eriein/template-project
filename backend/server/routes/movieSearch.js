const express = require('express');
const axios = require('axios');
const { z } = require('zod');
const router = express.Router();

const searchQuerySchema = z
  .string({ required_error: 'query param is required.' })
  .trim()
  .min(1, 'Search query cannot be empty.')
  .max(100, 'Search query is too long.');

const pageSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 1))
  .refine((val) => val >= 1 && val <= 100, 'Page must be between 1 and 100');


// Data transformation functions live here so they can be tested with plain inputs
// and no network setup. The route handler below only fetches and delegates to these.
const hasPoster = (movie) => Boolean(movie.Poster && movie.Poster !== 'N/A');

const toMovieShape = (movie) => ({
  imdbId: movie.imdbID,
  title: movie.Title,
  year: movie.Year,
  poster: movie.Poster,
});

const calcTotalPages = (totalResults) => Math.ceil(totalResults / 10);

const buildSearchResponse = ({ query, page, raw, totalResults }) => {
  const results = raw.filter(hasPoster).map(toMovieShape);
  return {
    query,
    page,
    totalResults,
    totalPages: calcTotalPages(totalResults),
    count: results.length,
    results,
  };
};

// The route handler only makes the network call and passes raw data to the
// functions above. No transformation logic lives here.
router.get('/search', async (req, res) => {
  const parsedQuery = searchQuerySchema.safeParse(req.query.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      error: 'Invalid request parameters.',
      details: parsedQuery.error.errors.map((err) => err.message)
    });
  }

  const parsedPage = pageSchema.safeParse(req.query.page);
  const page = parsedPage.success ? parsedPage.data : 1;

  if (!process.env.OMDB_API_KEY) {
    return res.status(500).json({
      error: 'Configuration error.',
      details: ['OMDB_API_KEY is missing.']
    });
  }

  const query = parsedQuery.data;

  try {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: { apikey: process.env.OMDB_API_KEY, s: query, type: 'movie', page },
      timeout: 8000
    });

    if (!response.data || typeof response.data !== 'object') {
      return res.status(502).json({ error: 'Invalid response from movie service.' });
    }

    if (response.data.Response === 'False') {
      return res.status(404).json({
        error: 'Movie not found.',
        details: [response.data.Error].filter(Boolean)
      });
    }

    res.json(buildSearchResponse({
      query,
      page,
      raw: response.data.Search || [],
      totalResults: parseInt(response.data.totalResults, 10) || 0,
    }));
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED';
    console.error('movieSearch fetch error', err.message);
    if (isTimeout) return res.status(504).json({ error: 'Movie service timed out.' });
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(502).json({ error: 'Movie service rejected the request.' });
    }
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
module.exports.hasPoster = hasPoster;
module.exports.toMovieShape = toMovieShape;
module.exports.calcTotalPages = calcTotalPages;
module.exports.buildSearchResponse = buildSearchResponse;