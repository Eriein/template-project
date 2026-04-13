import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ReactNavbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const [user, setUser] = useState({});
  const [lastMovieId, setLastMovieId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
    try {
      const saved = localStorage.getItem('lastViewedMovie');
      if (saved) setLastMovieId(JSON.parse(saved).imdbId);
    } catch {}
  }, [location.pathname]);

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <Nav className="me-auto">
          <Nav.Link href="/home">Home</Nav.Link>
          {lastMovieId && (
            <Nav.Link href={`/movie/${lastMovieId}`}>Movie Info</Nav.Link>
          )}
          <Nav.Link href="/cinemas">Cinema Search</Nav.Link>
          <Nav.Link href="/privateUserProfile">Profile</Nav.Link>
          <Nav.Link href="/gamePage">Game Page</Nav.Link>
        </Nav>
      </Container>
    </ReactNavbar>
  );
}