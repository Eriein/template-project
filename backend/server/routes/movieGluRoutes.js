const express = require("express");
const router = express.Router();

const MOVIEGLU_BASE_URL = "https://api-gate2.movieglu.com";

const movieGluHeaders = (geolocation = "-22.0;14.0") => {
    return {
        client: "SALE_2",
        "x-api-key": "	FVD63qmAUm7FNtarC4vel2Zyv3ae8DwzfRxgAcne",
        authorization: "Basic U0FMRV8yX1hYOnQyVFU0ZWxwQ3pQVQ==",
        territory: "XX",
        "api-version": "v201",
        geolocation: geolocation,
        "device-datetime": new Date().toISOString(),
    };
};

router.get("/nearby", async (req, res) => {
    try {
        const zipCode = req.query.zip;

        if (!zipCode) {
            return res.status(400).json({ message: "zipCode required" });
        }

        const geo = "-22.0;14.0";

        const response = await fetch(
            `${MOVIEGLU_BASE_URL}/cinemasNearby/?n=5`,
            {
                headers: movieGluHeaders(geo),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        const cinemas = (data.cinemas || []).map((cinema) => ({
            id: cinema.cinema_id,
            name: cinema.cinema_name,
            address: cinema.address,
            city: cinema.city,
            state: cinema.state,
            distance: cinema.distance,
            logo: cinema.logo_url,
            lat: cinema.lat,
            lng: cinema.lng,
        }));

        res.json(cinemas);
    } catch (error) {
        console.error("MovieGlu nearby error:", error);
        res.status(500).json({ error: "MovieGlu nearby request failed" });
    }
});

router.get("/cinema/:cinemaId", async (req, res) => {
    try {
        const { cinemaId } = req.params;

        if (!cinemaId) {
            return res.status(400).json({ message: "cinemaId is required" });
        }

        const today = new Date().toISOString().split("T")[0];

        const response = await fetch(
            `${MOVIEGLU_BASE_URL}/cinemaShowTimes/?cinema_id=${cinemaId}&date=${today}`,
            {
                headers: movieGluHeaders("-22.0;14.0"),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        const films = (data.films || []).map((film) => ({
            id: film.film_id,
            name: film.film_name,
            ageRating: film.age_rating?.[0]?.rating || "N/A",
            poster: film.images?.poster?.[1]?.medium?.film_image || "",
            showtimes:
                film.showings?.Standard?.times?.map((timeObj) => timeObj.start_time) ||
                [],
        }));

        res.json({
            cinemaId,
            date: today,
            films,
        });
    } catch (error) {
        console.error("MovieGlu cinema details error:", error);
        res.status(500).json({ error: "MovieGlu cinema request failed" });
    }
});

module.exports = router;