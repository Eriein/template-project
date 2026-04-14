const {
  hasTmdbPoster,
  formatRating,
  extractYear,
  toPosterUrl,
  toMovieShape,
  buildTopRatedResponse,
} = require('../../routes/movieTopRated');

describe('hasTmdbPoster', () => {
  it('returns true when poster_path is present', () => {
    expect(hasTmdbPoster({ poster_path: '/abc123.jpg' })).toBe(true);
  });

  it('returns false when poster_path is null', () => {
    expect(hasTmdbPoster({ poster_path: null })).toBe(false);
  });

  it('returns false when poster_path is missing', () => {
    expect(hasTmdbPoster({})).toBe(false);
  });
});

describe('formatRating', () => {
  it('formats a float to one decimal place', () => {
    expect(formatRating(8.756)).toBe('8.8');
  });

  it('formats a whole number with one decimal place', () => {
    expect(formatRating(9)).toBe('9.0');
  });

  it('returns null when voteAverage is null', () => {
    expect(formatRating(null)).toBeNull();
  });

  it('returns null when voteAverage is undefined', () => {
    expect(formatRating(undefined)).toBeNull();
  });
});

describe('extractYear', () => {
  it('extracts the 4-digit year from a full date string', () => {
    expect(extractYear('2010-07-16')).toBe('2010');
  });

  it('returns an empty string when releaseDate is falsy', () => {
    expect(extractYear(null)).toBe('');
    expect(extractYear('')).toBe('');
    expect(extractYear(undefined)).toBe('');
  });
});

describe('toPosterUrl', () => {
  it('prepends the TMDB base image URL', () => {
    expect(toPosterUrl('/abc123.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc123.jpg'
    );
  });
});

describe('toMovieShape (movieTopRated)', () => {
  const rawMovie = {
    title: 'The Shawshank Redemption',
    release_date: '1994-09-23',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    vote_average: 8.707,
  };

  it('maps TMDB fields to the expected shape with imdbId', () => {
    const result = toMovieShape(rawMovie, 'tt0111161');
    expect(result).toEqual({
      imdbId: 'tt0111161',
      title: 'The Shawshank Redemption',
      year: '1994',
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      rating: '8.7',
    });
  });

  it('includes a null imdbId when none is returned from external_ids', () => {
    const result = toMovieShape(rawMovie, null);
    expect(result.imdbId).toBeNull();
  });
});

describe('buildTopRatedResponse', () => {
  const candidates = [
    {
      title: 'Movie A',
      release_date: '2000-01-01',
      poster_path: '/a.jpg',
      vote_average: 9.0,
    },
    {
      title: 'Movie B',
      release_date: '2001-05-12',
      poster_path: '/b.jpg',
      vote_average: 8.5,
    },
    {
      title: 'Movie C — no imdb match',
      release_date: '2002-03-10',
      poster_path: '/c.jpg',
      vote_average: 7.2,
    },
  ];

  it('filters out candidates with no imdbId', () => {
    const imdbIds = ['tt0000001', 'tt0000002', null];
    const response = buildTopRatedResponse(candidates, imdbIds);
    expect(response.results).toHaveLength(2);
    expect(response.results.map((m) => m.imdbId)).toEqual([
      'tt0000001',
      'tt0000002',
    ]);
  });

  it('returns an empty results array when all imdbIds are null', () => {
    const response = buildTopRatedResponse(candidates, [null, null, null]);
    expect(response.results).toHaveLength(0);
  });

  it('returns results with correct shape for each movie', () => {
    const imdbIds = ['tt0000001', null, null];
    const response = buildTopRatedResponse(candidates, imdbIds);
    expect(response.results[0]).toMatchObject({
      imdbId: 'tt0000001',
      title: 'Movie A',
      year: '2000',
      rating: '9.0',
    });
  });
});