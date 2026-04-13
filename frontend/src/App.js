import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import './css/card.css';
import './index.css';

import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import MovieDetailPage from "./components/pages/movieDetailPage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";
import CinemaSearchPage from "./components/pages/cinemaSearchPage";
import CinemaDetailPage from "./components/pages/cinemaDetailPage";
import GamePage from "./components/pages/gamePage";

export const UserContext = createContext();
export const LastMovieContext = createContext();

const HIDE_NAVBAR_ON = ['/', '/login', '/signup'];

const App = () => {
  const [user, setUser] = useState();
  const [lastMovie, setLastMovie] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lastViewedMovie')) || null; }
    catch { return null; }
  });
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <UserContext.Provider value={user}>
      <LastMovieContext.Provider value={[lastMovie, setLastMovie]}>
        {!HIDE_NAVBAR_ON.includes(location.pathname) && <Navbar />}
        <Routes>
            <Route exact path="/" element={<LandingPage />} />
            <Route exact path="/home" element={<HomePage />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route path="/privateUserProfile" element={<PrivateUserProfile />} />
            <Route path="/cinemas" element={<CinemaSearchPage />} />
            <Route path="/cinema/:cinemaId" element={<CinemaDetailPage />} />
            <Route path="/movie/:imdbId" element={<MovieDetailPage />} />
            <Route exact path="/gamePage" element={<GamePage />} />
        </Routes>
      </LastMovieContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
