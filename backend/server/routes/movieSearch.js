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
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: query,
        type: 'movie',
        page: page
      },
      timeout: 8000
    });

    if (!response.data || typeof response.data !== 'object') {
      return res.status(502).json({
        error: 'Invalid response from movie service.'
      });
    }

    if (response.data.Response === 'False') {
      return res.status(404).json({
        error: 'Movie not found.',
        details: [response.data.Error].filter(Boolean)
      });
    }

    const results = response.data.Search || [];
    const totalResults = parseInt(response.data.totalResults, 10) || 0;
    const totalPages = Math.ceil(totalResults / 10);

    res.json({
      query,
      page,
      totalResults,
      totalPages,
      count: results.length,
      results: results.map((movie) => ({
        imdbId: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster !== 'N/A' ? movie.Poster : null
      }))
    });
  } catch (err) {
    const status = err.response?.status;
    const isTimeout = err.code === 'ECONNABORTED';
    console.error('movieSearch fetch error', err.message);

    if (isTimeout) {
      return res.status(504).json({ error: 'Movie service timed out.' });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Movie service rejected the request.'
      });
    }

    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;