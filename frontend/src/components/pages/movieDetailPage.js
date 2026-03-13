import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Container, Spinner } from 'react-bootstrap';
import '../../css/movieDetailPage.css';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_SERVER_URI || 'http://localhost:8081';

const MovieDetailPage = () => {
  const { imdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                  <button className="movie-action-btn" type="button" disabled>
                    Generate AI Review
                  </button>
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
    </div>
  );
};

export default MovieDetailPage;
