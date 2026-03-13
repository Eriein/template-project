import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';

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
    <Container className="my-4">
      <Row className="mb-3">
        <Col>
          <h1 className="mb-1">{movie?.title || 'Movie Detail'}</h1>
          {movie?.imdbId && (
            <Badge bg="secondary">IMDb: {movie.imdbId}</Badge>
          )}
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Spinner animation="border" variant="primary" />}

      {!loading && !error && movie && (
        <Row className="g-4">
          <Col md={4}>
            <Card>
              {posterUrl ? (
                <Card.Img variant="top" src={posterUrl} alt={`${movie.title} poster`} />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '22rem' }}>
                  Poster not available
                </div>
              )}
            </Card>
          </Col>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Actors</Card.Title>
                {actors.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {actors.map((actor) => (
                      <Badge bg="info" text="dark" key={actor}>
                        {actor}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Card.Text>Actors not available.</Card.Text>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body className="py-4">
                <Card.Title>Plot</Card.Title>
                {hasPlot ? (
                  <div className="d-flex flex-column gap-3 mt-3">
                    {plot.introduction && (
                      <Card.Text className="mb-0">
                        <strong>Introduction:</strong> {plot.introduction}
                      </Card.Text>
                    )}
                    {plot.keyEvents && (
                      <Card.Text className="mb-0">
                        <strong>Key Events:</strong> {plot.keyEvents}
                      </Card.Text>
                    )}
                    {plot.conclusion && (
                      <Card.Text className="mb-0">
                        <strong>Conclusion:</strong> {plot.conclusion}
                      </Card.Text>
                    )}
                  </div>
                ) : (
                  <Card.Text>Plot not available.</Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MovieDetailPage;
