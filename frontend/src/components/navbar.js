import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserContext, LastMovieContext } from '../App';
import getUserInfo from '../utilities/decodeJwt';

const COLORS = {
  bg: '#0e090b',
  red: '#dc2626',
  textPrimary: '#f5f0f2',
  textMuted: '#a89aa2',
  border: '#2e1f28',
};


const styles = {
  nav: {
    fontFamily: "'Outfit', 'Source Sans 3', sans-serif",
    background: COLORS.bg,
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 32px',
    height: '52px',
    gap: '32px',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: COLORS.textPrimary,
    textDecoration: 'none',
    marginRight: '32px',
  },
  logoAccent: {
    color: COLORS.red,
  },
  logoutBtn: (hovered) => ({
    marginLeft: 'auto',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: hovered ? COLORS.textPrimary : COLORS.textMuted,
    fontFamily: "'Outfit', 'Source Sans 3', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s',
  }),
  link: (active, hovered) => ({
    fontSize: '0.9rem',
    fontWeight: 600,
    color: active || hovered ? COLORS.textPrimary : COLORS.textMuted,
    textDecoration: 'none',
    borderBottom: active ? `2px solid ${COLORS.red}` : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap',
  }),
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={styles.link(active, hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const user = useContext(UserContext) || getUserInfo();
  const [lastMovie] = useContext(LastMovieContext);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to={user ? '/home' : '/'} style={styles.logo}>
        Movie<span style={styles.logoAccent}>Now</span>
      </Link>

      {user && (
        <>
          <NavLink to="/home">Home</NavLink>
          {lastMovie?.imdbId && (
            <NavLink to={`/movie/${lastMovie.imdbId}`}>Last Viewed</NavLink>
          )}
          <NavLink to="/cinemas">Cinema Search</NavLink>
          <NavLink to="/privateUserProfile">Profile</NavLink>
          <NavLink to="/gamePage">Game Page</NavLink>
          <button
            style={styles.logoutBtn(logoutHovered)}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      )}
    </nav>
  );
}