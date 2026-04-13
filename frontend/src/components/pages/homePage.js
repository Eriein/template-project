import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getUserInfo from '../../utilities/decodeJwt';

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
    maxWidth: '800px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '48px',
  },
  welcome: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  username: {
    color: COLORS.red,
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
  searchSection: {
    marginBottom: '32px',
  },
  searchLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '12px',
    display: 'block',
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  searchBtn: (hovered) => ({
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    background: hovered ? COLORS.redHover : COLORS.red,
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  }),
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
    textDecoration: 'none',
    display: 'block',
  },
  resultPoster: {
    width: '100%',
    aspectRatio: '2/3',
    objectFit: 'cover',
    background: COLORS.surfaceHover,
  },
  resultInfo: {
    padding: '12px',
  },
  resultTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: COLORS.textPrimary,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  resultYear: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: COLORS.textMuted,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '1rem',
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
  }),
};

const HomePage = () => {
  const [user, setUser] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;
    
    setHasSearched(true);
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
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('accessToken');
    return navigate('/');
  };

  const handleCardClick = (imdbId) => {
    navigate(`/movie/${imdbId}`);
  };

  React.useEffect(() => {
    setUser(getUserInfo());
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
        <header style={styles.header}>
          <span style={styles.welcome}>
            Welcome, <span style={styles.username}>{username}</span>
          </span>
          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={(e) => e.target.style.color = COLORS.textPrimary}
            onMouseLeave={(e) => e.target.style.color = COLORS.textMuted}
          >
            Log Out
          </button>
        </header>

        <section style={styles.searchSection}>
          <label style={styles.searchLabel}>Search for a movie</label>
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Enter movie title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.searchInput}
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

        {hasSearched && searchResults.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎬</div>
            <p style={styles.emptyText}>No movies found. Try a different search.</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={styles.resultsGrid}>
            {searchResults.map((movie) => (
              <div
                key={movie.imdbId}
                style={styles.resultCard}
                onClick={() => handleCardClick(movie.imdbId)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    style={styles.resultPoster}
                  />
                ) : (
                  <div style={{ ...styles.resultPoster, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>🎬</span>
                  </div>
                )}
                <div style={styles.resultInfo}>
                  <div style={styles.resultTitle}>{movie.title}</div>
                  <div style={styles.resultYear}>{movie.year}</div>
                </div>
              </div>
            ))}
          </div>
        )}

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