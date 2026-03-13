const express = require('express');
const axios = require('axios');
const { z } = require('zod');
const router = express.Router();

const imdbIdSchema = z
  .string({ required_error: 'imdbId query param is required.' })
  .trim()
  .regex(/^tt\d{7,8}$/, 'imdbId must be a valid IMDb ID (e.g., tt1375666).');

// helper that splits a block of text into three roughly equal sections
function splitPlot(plot) {
  // break on sentence boundaries, keeping the delimiter
  const sentences = plot.split(/(?<=[.?!])\s+/);
  if (sentences.length === 0) {
    return { introduction: '', keyEvents: '', conclusion: '' };
  }

  const third = Math.ceil(sentences.length / 3);
  return {
    introduction: sentences.slice(0, third).join(' '),
    keyEvents: sentences.slice(third, third * 2).join(' '),
    conclusion: sentences.slice(third * 2).join(' ')
  };
}

// GET /movies/plot?imdbId=tt1375666
// returns title, poster URL and the plot split into three fields
router.get('/plot', async (req, res) => {
  const parsedImdbId = imdbIdSchema.safeParse(req.query.imdbId);
  if (!parsedImdbId.success) {
    return res.status(400).json({
      error: 'Invalid request parameters.',
      details: parsedImdbId.error.errors.map((err) => err.message)
    });
  }

  if (!process.env.OMDB_API_KEY) {
    return res.status(500).json({
      error: 'Configuration error.',
      details: ['OMDB_API_KEY is missing.']
    });
  }

  const imdbId = parsedImdbId.data;

  try {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: process.env.OMDB_API_KEY,
        i: imdbId,
        plot: 'full'
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

    if (!response.data.Title) {
      return res.status(502).json({
        error: 'Incomplete data from movie service.'
      });
    }

    const plotText = response.data.Plot || '';
    const sections = splitPlot(plotText);

    res.json({
      imdbId,
      title: response.data.Title,
      actors: response.data.Actors || '',    // comma-separated string
      poster: response.data.Poster,          // image URL (may be "N/A")
      plot: sections
    });
  } catch (err) {
    const status = err.response?.status;
    const isTimeout = err.code === 'ECONNABORTED';
    console.error('plotSummary fetch error', err.message);

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
