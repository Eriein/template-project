import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getUserInfo from '../../utilities/decodeJwt';
import '../../css/landingPage.css';

const COLORS = {
  bg: '#0e090b',
  surface: '#1a1118',
  surfaceHover: '#221520',
  red: '#dc2626',
  redHover: '#b91c1c',
  textPrimary: '#f5f0f2',
  textMuted: '#a89aa2',
  border: '#2e1f28',
};

const styles = {
  root: {
    fontFamily: "'Outfit', 'Source Sans 3', sans-serif",
    background: COLORS.bg,
    color: COLORS.textPrimary,
    minHeight: '100vh',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    maxWidth: '960px',
    width: '100%',
  },
  heroWrapper: {
    position: 'relative',
    textAlign: 'center',
    paddingBottom: '48px',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    width: '600px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px',
  },
  logoutBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: COLORS.textMuted,
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  eyebrow: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: '16px',
  },
  welcome: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #f5f0f2 30%, #dc2626 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  tagline: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    marginBottom: '36px',
    lineHeight: 1.6,
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    maxWidth: '640px',
    margin: '0 auto',
  },
  searchInput: {
    flex: 1,
    padding: '16px 20px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchBtn: (hovered) => ({
    padding: '16px 28px',
    borderRadius: '8px',
    border: 'none',
    background: hovered ? COLORS.redHover : COLORS.red,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
  }),
  resultsHeader: {
    fontSize: '0.82rem',
    color: COLORS.textMuted,
    fontWeight: 600,
    borderLeft: `3px solid ${COLORS.red}`,
    paddingLeft: '10px',
    marginBottom: '20px',
    marginTop: '8px',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '20px',
  },
  resultCard: {
    background: COLORS.surface,
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
  },
  resultPoster: {
    width: '100%',
    aspectRatio: '2/3',
    objectFit: 'cover',
    display: 'block',
    background: COLORS.surfaceHover,
  },
  posterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '32px 12px 12px',
    background: 'linear-gradient(to top, rgba(14,9,11,0.92) 0%, transparent 100%)',
  },
  resultTitle: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: COLORS.textPrimary,
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  resultYear: {
    fontSize: '0.78rem',
    color: COLORS.textMuted,
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
    color: COLORS.textMuted,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '8px',
  },
  emptyHint: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    opacity: 0.7,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
  },
  pageBtn: (disabled, isActive) => ({
    padding: '8px 14px',
    borderRadius: '6px',
    border: `1px solid ${isActive ? COLORS.red : COLORS.border}`,
    background: isActive ? COLORS.red : 'transparent',
    color: disabled ? COLORS.textMuted : COLORS.textPrimary,
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
    opacity: disabled ? 0.5 : 1,
  }),
};

const HomePage = () => {
  const [user, setUser] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    setSubmittedQuery(searchQuery.trim());
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_SERVER_URI}/movies/search`,
        { params: { query: searchQuery.trim(), page } }
      );
      setSearchResults(response.data.results || []);
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch(1);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('accessToken');
    return navigate('/');
  };

  React.useEffect(() => {
    setUser(getUserInfo());
    axios
      .get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/movies/top-rated`)
      .then((res) => setTopRated(res.data.results || []))
      .catch(() => {});
  }, []);

  if (!user) return (
    <div style={styles.root}>
      <div style={styles.container}>
        <h4>Log in to view this page.</h4>
      </div>
    </div>
  );

  const { username } = user;

  return (
    <div style={styles.root}>
      <div style={styles.container}>

        {/* Logout row */}
        <div style={styles.headerRow} className="lp-fade-up">
          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.color = COLORS.textPrimary)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.textMuted)}
          >
            Log Out
          </button>
        </div>

        {/* Hero */}
        <section style={styles.heroWrapper}>
          <div className="lp-glow" style={styles.glow} />

          <p style={styles.eyebrow} className="lp-fade-up">Your Movie Hub</p>

          <h1 style={styles.welcome} className="lp-fade-up-delay-1">
            Welcome, {username}
          </h1>

          <p style={styles.tagline} className="lp-fade-up-delay-2">
            Search any film and explore AI-powered reviews.
          </p>

          <div style={styles.searchRow} className="lp-fade-up-delay-3">
            <input
              type="text"
              placeholder="Enter movie title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={{
                ...styles.searchInput,
                borderColor: inputFocused ? COLORS.red : COLORS.border,
                boxShadow: inputFocused ? '0 0 0 2px rgba(220,38,38,0.25)' : 'none',
              }}
            />
            <button
              style={styles.searchBtn(hoveredBtn)}
              onClick={() => handleSearch(1)}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
            >
              Search
            </button>
          </div>
        </section>

        {/* Top-rated section — visible until user searches */}
        {!hasSearched && topRated.length > 0 && (
          <>
            <p style={styles.resultsHeader}>Top 10 on IMDb</p>
            <div style={styles.resultsGrid}>
              {topRated.map((movie) => (
                <div
                  key={movie.imdbId}
                  style={styles.resultCard}
                  onClick={() => navigate(`/movie/${movie.imdbId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img src={movie.poster} alt={movie.title} style={styles.resultPoster} />
                  <div style={styles.posterOverlay}>
                    <div style={styles.resultTitle}>{movie.title}</div>
                    <div style={styles.resultYear}>{movie.rating} ★ · {movie.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No results */}
        {hasSearched && searchResults.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyText}>No movies found.</p>
            <p style={styles.emptyHint}>Try a different title or check the spelling.</p>
          </div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <>
            <p style={styles.resultsHeader}>Results for "{submittedQuery}"</p>
            <div style={styles.resultsGrid}>
              {searchResults.map((movie) => (
                <div
                  key={movie.imdbId}
                  style={styles.resultCard}
                  onClick={() => navigate(`/movie/${movie.imdbId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img src={movie.poster} alt={movie.title} style={styles.resultPoster} />
                  <div style={styles.posterOverlay}>
                    <div style={styles.resultTitle}>{movie.title}</div>
                    <div style={styles.resultYear}>{movie.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn(currentPage === 1, false)}
              onClick={() => handleSearch(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              style={styles.pageBtn(currentPage === totalPages, false)}
              onClick={() => handleSearch(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;