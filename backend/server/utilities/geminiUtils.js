const axios = require('axios');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const extractGeminiText = (responseData) => {
  const parts = responseData?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text).join('').trim();
};

const fetchMovieDetails = async (omdbId) => {
  if (!process.env.OMDB_API_KEY) {
    return { error: 'Configuration error.', details: ['OMDB_API_KEY is missing.'] };
  }
  const response = await axios.get('http://www.omdbapi.com/', {
    params: { apikey: process.env.OMDB_API_KEY, i: omdbId, plot: 'full' },
    timeout: 8000
  });
  if (!response.data || typeof response.data !== 'object') {
    return { error: 'Invalid response from movie service.' };
  }
  if (response.data.Response === 'False') {
    return { error: 'Movie not found.', details: [response.data.Error].filter(Boolean) };
  }
  return {
    title: response.data.Title,
    year: response.data.Year,
    plot: response.data.Plot,
    actors: response.data.Actors
  };
};

module.exports = { GEMINI_ENDPOINT, extractGeminiText, fetchMovieDetails };