import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ReactNavbar from 'react-bootstrap/Navbar';

// Here, we display our Navbar
export default function Navbar() {
  // We are pulling in the user's info but not using it for now.
  // Warning disabled:
  // eslint-disable-next-line
  const [user, setUser] = useState({});
  const [lastMovieId, setLastMovieId] = useState(null);

  useEffect(() => {
    setUser(getUserInfo());
    try {
      const saved = localStorage.getItem('lastViewedMovie');
      if (saved) setLastMovieId(JSON.parse(saved).imdbId);
    } catch {}
  }, []);

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <Nav className="me-auto">
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