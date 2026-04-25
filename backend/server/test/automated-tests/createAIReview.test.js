const {
  validateReviewRequest,
  isValidReviewLength,
  buildPrompt,
} = require('../../routes/createAIReview');

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

describe('validateReviewRequest', () => {
  it('returns normalized values for a valid request', () => {
    const result = validateReviewRequest({ omdbId: 'tt1375666', userId: VALID_OBJECT_ID });
    expect(result.normalizedOmdbId).toBe('tt1375666');
    expect(result.error).toBeUndefined();
  });

  it('trims whitespace from omdbId', () => {
    const result = validateReviewRequest({ omdbId: '  tt1375666  ', userId: VALID_OBJECT_ID });
    expect(result.normalizedOmdbId).toBe('tt1375666');
  });

  it('trims whitespace from review when provided', () => {
    const result = validateReviewRequest({ omdbId: 'tt1375666', userId: VALID_OBJECT_ID, review: '  great film  ' });
    expect(result.normalizedReview).toBe('great film');
  });

  it('returns error when omdbId is missing', () => {
    const result = validateReviewRequest({ userId: VALID_OBJECT_ID });
    expect(result.error).toBe('Missing required fields.');
    expect(result.status).toBe(400);
  });

  it('returns error when userId is missing', () => {
    const result = validateReviewRequest({ omdbId: 'tt1375666' });
    expect(result.error).toBe('Missing required fields.');
    expect(result.status).toBe(400);
  });

  it('returns error when omdbId is not a string', () => {
    const result = validateReviewRequest({ omdbId: 42, userId: VALID_OBJECT_ID });
    expect(result.error).toBe('omdbId must be a non-empty string.');
    expect(result.status).toBe(400);
  });

  it('returns error when omdbId is an empty string after trimming', () => {
    const result = validateReviewRequest({ omdbId: '   ', userId: VALID_OBJECT_ID });
    expect(result.error).toBe('omdbId must be a non-empty string.');
  });

  it('returns error when userId is not a valid ObjectId', () => {
    const result = validateReviewRequest({ omdbId: 'tt1375666', userId: 'not-an-id' });
    expect(result.error).toBe('userId must be a valid ObjectId.');
    expect(result.status).toBe(400);
  });
});

describe('isValidReviewLength', () => {
  it('returns true for exactly 50 characters', () => {
    expect(isValidReviewLength('a'.repeat(50))).toBe(true);
  });

  it('returns true for exactly 1000 characters', () => {
    expect(isValidReviewLength('a'.repeat(1000))).toBe(true);
  });

  it('returns true for a length in the middle of the range', () => {
    expect(isValidReviewLength('a'.repeat(500))).toBe(true);
  });

  it('returns false for 49 characters', () => {
    expect(isValidReviewLength('a'.repeat(49))).toBe(false);
  });

  it('returns false for 1001 characters', () => {
    expect(isValidReviewLength('a'.repeat(1001))).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidReviewLength('')).toBe(false);
  });
});

describe('buildPrompt', () => {
  it('includes the title, plot, and actors in the output', () => {
    const prompt = buildPrompt({ title: 'Inception', plot: 'A dream thief.', actors: 'Leonardo DiCaprio' });
    expect(prompt).toContain('Inception');
    expect(prompt).toContain('A dream thief.');
    expect(prompt).toContain('Leonardo DiCaprio');
  });

  it('uses safe defaults when fields are missing', () => {
    const prompt = buildPrompt({});
    expect(prompt).toContain('Unknown title');
    expect(prompt).toContain('Plot details are unavailable.');
    expect(prompt).toContain('Cast information is unavailable.');
  });

  it('starts with the review instruction', () => {
    const prompt = buildPrompt({ title: 'Dune' });
    expect(prompt).toMatch(/^Write a short, engaging movie review/);
  });

  it('ends with the "Review:" label', () => {
    const prompt = buildPrompt({ title: 'Dune' });
    expect(prompt.trim()).toMatch(/Review:$/);
  });
});