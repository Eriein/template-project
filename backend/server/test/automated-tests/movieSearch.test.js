const {
  hasPoster,
  toMovieShape,
  calcTotalPages,
  buildSearchResponse,
} = require('../../routes/movieSearch');

describe('hasPoster', () => {
  it('returns true when Poster is a valid URL', () => {
    expect(hasPoster({ Poster: 'https://example.com/poster.jpg' })).toBe(true);
  });

  it('returns false when Poster is "N/A"', () => {
    expect(hasPoster({ Poster: 'N/A' })).toBe(false);
  });

  it('returns false when Poster is missing', () => {
    expect(hasPoster({})).toBe(false);
  });

  it('returns false when Poster is an empty string', () => {
    expect(hasPoster({ Poster: '' })).toBe(false);
  });
});

describe('toMovieShape', () => {
  const rawMovie = {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster: 'https://example.com/inception.jpg',
  };

  it('maps OMDB fields to the expected shape', () => {
    expect(toMovieShape(rawMovie)).toEqual({
      imdbId: 'tt1375666',
      title: 'Inception',
      year: '2010',
      poster: 'https://example.com/inception.jpg',
    });
  });

  it('preserves missing fields as undefined rather than throwing', () => {
    const result = toMovieShape({});
    expect(result).toHaveProperty('imdbId', undefined);
    expect(result).toHaveProperty('title', undefined);
  });
});

describe('calcTotalPages', () => {
  it('rounds up when results do not divide evenly', () => {
    expect(calcTotalPages(25)).toBe(3);
  });

  it('returns exact page count when results divide evenly', () => {
    expect(calcTotalPages(20)).toBe(2);
  });

  it('returns 0 for 0 results', () => {
    expect(calcTotalPages(0)).toBe(0);
  });

  it('returns 1 for fewer than 10 results', () => {
    expect(calcTotalPages(7)).toBe(1);
  });
});

describe('buildSearchResponse', () => {
  const withPoster = {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight',
    Year: '2008',
    Poster: 'https://example.com/dark-knight.jpg',
  };
  const withoutPoster = {
    imdbID: 'tt9999999',
    Title: 'No Poster Movie',
    Year: '2020',
    Poster: 'N/A',
  };

  it('filters out movies without posters', () => {
    const response = buildSearchResponse({
      query: 'batman',
      page: 1,
      raw: [withPoster, withoutPoster],
      totalResults: 2,
    });
    expect(response.results).toHaveLength(1);
    expect(response.results[0].imdbId).toBe('tt0468569');
  });

  it('returns correct metadata fields', () => {
    const response = buildSearchResponse({
      query: 'batman',
      page: 2,
      raw: [withPoster],
      totalResults: 15,
    });
    expect(response.query).toBe('batman');
    expect(response.page).toBe(2);
    expect(response.totalResults).toBe(15);
    expect(response.totalPages).toBe(2);
    expect(response.count).toBe(1);
  });

  it('returns empty results when all movies lack posters', () => {
    const response = buildSearchResponse({
      query: 'obscure',
      page: 1,
      raw: [withoutPoster],
      totalResults: 1,
    });
    expect(response.results).toHaveLength(0);
    expect(response.count).toBe(0);
  });
});