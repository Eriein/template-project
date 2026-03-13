import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Container, Spinner } from 'react-bootstrap';
import '../../css/movieDetailPage.css';
import getUserInfo from '../../utilities/decodeJwt';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_SERVER_URI || 'http://localhost:8081';

const MovieDetailPage = () => {
  const { imdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState('');
  const [aiReviews, setAiReviews] = useState([]);
  const [aiReviewsLoading, setAiReviewsLoading] = useState(false);
  const [aiReviewsError, setAiReviewsError] = useState('');
  const [aiReviewDeletingId, setAiReviewDeletingId] = useState(null);

  const userId = user?.id;

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  useEffect(() => {
    if (!imdbId) {
      setError('Missing IMDb ID in the URL.');
      return;
    }

    let cancelled = false;

    async function fetchMovie() {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/movies/plot`, {
          params: { imdbId }
        });

        if (!cancelled) {
          setMovie(response.data);
        }
      } catch (err) {
        if (cancelled) return;
        const apiError = err.response?.data?.error;
        const details = err.response?.data?.details;
        const detailText = Array.isArray(details) && details.length > 0 ? ` ${details.join(' ')}` : '';
        setError(apiError ? `${apiError}${detailText}` : 'Failed to load movie data.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMovie();

    return () => {
      cancelled = true;
    };
  }, [imdbId]);

  const actors = useMemo(() => {
    if (!movie?.actors) return [];
    return movie.actors
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }, [movie]);

  const posterUrl = movie?.poster && movie.poster !== 'N/A' ? movie.poster : '';
  const plot = movie?.plot || { introduction: '', keyEvents: '', conclusion: '' };
  const hasPlot = plot.introduction || plot.keyEvents || plot.conclusion;

  useEffect(() => {
    if (!userId) {
      setAiReviews([]);
      return;
    }

    let cancelled = false;

    async function fetchAIReviews() {
      setAiReviewsLoading(true);
      setAiReviewsError('');
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/user/reviews`, {
          params: { userId }
        });

        if (!cancelled) {
          setAiReviews(response.data || []);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setAiReviews([]);
          return;
        }
        const apiError = err.response?.data?.error || err.response?.data;
        setAiReviewsError(apiError || 'Failed to load AI reviews.');
      } finally {
        if (!cancelled) {
          setAiReviewsLoading(false);
        }
      }
    }

    fetchAIReviews();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleGenerateReview = async () => {
    if (!userId || !imdbId) return;

    setAiReviewLoading(true);
    setAiReviewError('');
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/user/reviews`, {
        omdbId: imdbId,
        userId
      });

      const payload = response.data || {};
      const reviewRecord = payload.review;
      const reviewText = reviewRecord?.review || '';

      if (reviewText.length < 50 || reviewText.length > 1000) {
        setAiReviewError('Generated review failed the length check.');
        return;
      }

      setAiReview({ ...reviewRecord, cached: payload.cached });

      const refreshed = await axios.get(`${BACKEND_BASE_URL}/user/reviews`, {
        params: { userId }
      });
      setAiReviews(refreshed.data || []);
    } catch (err) {
      const status = err.response?.status;
      const apiError = err.response?.data?.error || err.response?.data;
      if (status === 429) {
        setAiReviewError(apiError || 'You have reached the limit. Please try again later.');
      } else {
        setAiReviewError(apiError || 'Failed to generate AI review.');
      }
    } finally {
      setAiReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!userId || !reviewId) return;
    const confirmDelete = window.confirm('Delete this review? This cannot be undone.');
    if (!confirmDelete) return;

    setAiReviewDeletingId(reviewId);
    setAiReviewsError('');

    try {
      await axios.delete(`${BACKEND_BASE_URL}/user/reviews/${reviewId}`, {
        params: { userId }
      });

      setAiReviews((prev) => prev.filter((review) => review._id !== reviewId));
      if (aiReview?._id === reviewId) {
        setAiReview(null);
      }
    } catch (err) {
      const apiError = err.response?.data?.error || err.response?.data;
      setAiReviewsError(apiError || 'Failed to delete review.');
    } finally {
      setAiReviewDeletingId(null);
    }
  };

  return (
    <div className="movie-detail-page">
      <header className="movie-hero">
        <div
          className="movie-hero__bg"
          style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
        />
        <div className="movie-hero__overlay" />
        <Container className="movie-hero__content">
          <div className="movie-hero__poster">
            {posterUrl ? (
              <img src={posterUrl} alt={`${movie?.title || 'Movie'} poster`} />
            ) : (
              <div className="movie-hero__poster-fallback">Poster not available</div>
            )}
          </div>
          <div className="movie-hero__info">
            <h1>{movie?.title || 'Movie Detail'}</h1>
            <p className="movie-hero__subtitle">
              {movie?.title
                ? 'A closer look at the story, cast, and key plot beats.'
                : 'Loading movie details and story highlights.'}
            </p>
          </div>
        </Container>
      </header>

      <Container className="movie-detail-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Spinner animation="border" variant="primary" />}

        {!loading && !error && movie && (
          <div className="movie-detail-grid">
            <section className="movie-card movie-card--plot">
              <header className="movie-card__header">
                <h2>Plot Summary</h2>
                <span className="movie-card__tag">Public Access</span>
              </header>
              <div className="movie-card__content">
                {hasPlot ? (
                  <>
                    {plot.introduction && (
                      <div className="movie-plot-block">
                        <h3>Introduction</h3>
                        <p>{plot.introduction}</p>
                      </div>
                    )}
                    {plot.keyEvents && (
                      <div className="movie-plot-block">
                        <h3>Key Events</h3>
                        <p>{plot.keyEvents}</p>
                      </div>
                    )}
                    {plot.conclusion && (
                      <div className="movie-plot-block">
                        <h3>Conclusion</h3>
                        <p>{plot.conclusion}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="movie-card__empty">Plot not available.</p>
                )}
              </div>
            </section>

            <aside className="movie-card movie-card--cast">
              <header className="movie-card__header">
                <h2>Top Cast</h2>
                <span className="movie-card__tag">Featured</span>
              </header>
              <div className="movie-card__content">
                {actors.length > 0 ? (
                  <div className="movie-cast-grid">
                    {actors.map((actor) => (
                      <div className="movie-cast-pill" key={actor}>
                        <span className="movie-cast-avatar">{actor[0]}</span>
                        <span className="movie-cast-name">{actor}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="movie-card__empty">Actors not available.</p>
                )}
                <div className="movie-cast-actions">
                  <button
                    className="movie-action-btn"
                    type="button"
                    onClick={handleGenerateReview}
                    disabled={!userId || aiReviewLoading || !imdbId}
                  >
                    {aiReviewLoading ? 'AI is thinking...' : 'Generate AI Review'}
                  </button>
                  {!userId && (
                    <span className="movie-cast-helper">Sign in to generate a review.</span>
                  )}
                </div>
                {actors.length > 0 && (
                  <div className="movie-cast-footer">
                    <Badge bg="secondary">Cast list sourced from OMDb</Badge>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {!loading && !error && movie && (
          <section className="movie-card movie-card--reviews">
            <header className="movie-card__header">
              <h2>My AI Reviews</h2>
              <span className="movie-card__tag">History</span>
            </header>
            <div className="movie-card__content">
              {aiReviewError && <p className="movie-card__empty">{aiReviewError}</p>}
              {aiReviewsError && <p className="movie-card__empty">{aiReviewsError}</p>}

              {aiReview && (
                <div className="movie-ai-review">
                  <div className="movie-ai-review__header">
                    <h3>Latest AI Review</h3>
                    <span className={`movie-ai-badge ${aiReview.cached ? 'is-cached' : 'is-new'}`}>
                      {aiReview.cached ? 'Stored' : 'New'}
                    </span>
                  </div>
                  <p>{aiReview.review}</p>
                </div>
              )}

              {aiReviewsLoading && <p className="movie-card__empty">Loading your reviews...</p>}

              {!aiReviewsLoading && aiReviews.length === 0 && (
                <p className="movie-card__empty">No AI reviews yet.</p>
              )}

              {!aiReviewsLoading && aiReviews.length > 0 && (
                <div className="movie-ai-list">
                  {aiReviews.map((review) => (
                    <div className="movie-ai-item" key={review._id}>
                      <div className="movie-ai-item__header">
                        <div className="movie-ai-item__meta">
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                          <span className="movie-ai-item__dot" />
                          <span>{review.omdbId}</span>
                        </div>
                        <div className="movie-ai-item__actions">
                          <button
                            className="movie-ai-delete"
                            type="button"
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={aiReviewDeletingId === review._id}
                          >
                            {aiReviewDeletingId === review._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      <p>{review.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default MovieDetailPage;
