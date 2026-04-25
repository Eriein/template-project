import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Container, Spinner } from 'react-bootstrap';
import '../../css/movieDetailPage.css';
import getUserInfo from '../../utilities/decodeJwt';
import { LastMovieContext } from '../../App';
import MovieChat from './MovieChat';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_SERVER_URI || 'http://localhost:8081';

// Extracts a readable message from an Axios error, with a fallback
const parseApiError = (err, fallback) => {
  const data = err.response?.data;
  const message = data?.error || (typeof data === 'string' ? data : null);
  const details = Array.isArray(data?.details) && data.details.length > 0
    ? ` ${data.details.join(' ')}` : '';
  return message ? `${message}${details}` : fallback;
};

// Checks if the server rejected the request due to rate limiting
const isRateLimited = (err) => err.response?.status === 429;

const MovieDetailPage = () => {
  const { imdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  const [, setLastMovie] = useContext(LastMovieContext);
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
          const viewed = {
            imdbId: response.data.imdbId,
            title: response.data.title,
            poster: response.data.poster,
          };
          localStorage.setItem('lastViewedMovie', JSON.stringify(viewed));
          setLastMovie(viewed);
        }
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, 'Failed to load movie data.'));
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

  const handleGenerateReview = async () => {
    if (!userId || !imdbId) return;

    setAiReviewLoading(true);
    setAiReviewError('');
    setDrawerOpen(true);
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/user/reviews`, {
        omdbId: imdbId,
        userId
      });

      const payload = response.data || {};
      const reviewRecord = payload.review;

      setAiReview({ ...reviewRecord, cached: payload.cached });
    } catch (err) {
      setAiReviewError(
        isRateLimited(err)
          ? parseApiError(err, 'You have reached the limit. Please try again later.')
          : parseApiError(err, 'Failed to generate AI review.')
      );
    } finally {
      setAiReviewLoading(false);
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
                  <button
                    className="movie-action-btn"
                    type="button"
                    onClick={() => { setChatDrawerOpen(true); setDrawerOpen(false); }}
                    disabled={!imdbId}
                  >
                    Chat about this movie
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

      </Container>

      {(drawerOpen || chatDrawerOpen) && (
        <div
          className="ai-review-drawer-overlay"
          onClick={() => { setDrawerOpen(false); setChatDrawerOpen(false); }}
        />
      )}
      <aside className={`ai-review-drawer${drawerOpen ? ' is-open' : ''}`}>
        <div className="ai-review-drawer__header">
          <h2>AI Review</h2>
          <div className="ai-review-drawer__header-actions">
            <button
              className="movie-action-btn"
              type="button"
              onClick={handleGenerateReview}
              disabled={!userId || aiReviewLoading || !imdbId}
            >
              {aiReviewLoading ? 'Thinking...' : 'Generate New'}
            </button>
            <button
              className="ai-review-drawer__close"
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="ai-review-drawer__body">
          {aiReviewError && (
            <p className="ai-review-drawer__error">{aiReviewError}</p>
          )}

          {aiReviewLoading && (
            <p className="movie-card__empty">AI is thinking...</p>
          )}

          {!aiReviewLoading && !aiReview && (
            <p className="movie-card__empty">Generate a review to get started.</p>
          )}

          {!aiReviewLoading && aiReview && (
            <div className="movie-ai-review">
              <p>{aiReview.review}</p>
            </div>
          )}
        </div>
      </aside>

      <aside className={`movie-chat-drawer${chatDrawerOpen ? ' is-open' : ''}`}>
        <div className="movie-chat-drawer__header">
          <h2>Movie Chat</h2>
          <button
            className="ai-review-drawer__close"
            type="button"
            onClick={() => setChatDrawerOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
        <div className="movie-chat-drawer__body">
          <MovieChat imdbId={imdbId} userId={userId} />
        </div>
      </aside>
    </div>
  );
};

export default MovieDetailPage;
