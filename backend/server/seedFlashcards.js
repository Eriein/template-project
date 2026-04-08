require("dotenv").config();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Flashcard = require("./models/flashcardModel");
const dbConnection = require("./config/db.config");

const OMDB_API_KEY = process.env.OMDB_API_KEY;

//flashcards - these are all the movies in the DB
const movieTitles = [
    "The Godfather",
    "Inception",
    "The Dark Knight",
    "Interstellar",
    "Pulp Fiction",
    "The Shawshank Redemption",
    "Forrest Gump",
    "The Matrix",
    "Jurassic Park",
    "Titanic",
    "Goodfellas",
    "Fight Club",
    "The Silence of the Lambs",
    "Schindlers List",
    "Avengers Endgame",
    "The Lion King",
    "Gladiator",
    "The Departed",
    "Whiplash",
    "Gone Girl",
    "La La Land",
    "No Country for Old Men",
    "There Will Be Blood",
    "The Social Network",
    "Django Unchained",
    "Inglourious Basterds",
    "The Grand Budapest Hotel",
    "Mad Max Fury Road",
    "Get Out",
    "Parasite",
    "Joker",
    "1917",
    "Dune",
    "Everything Everywhere All at Once",
    "The Revenant",
    "Black Swan",
    "Prisoners",
    "Knives Out",
    "Baby Driver",
    "John Wick",
    "Hereditary",
    "Midsommar",
    "The Truman Show",
    "American History X",
    "A Beautiful Mind",
    "Cast Away",
    "The Prestige",
    "Memento",
    "Catch Me If You Can",
    "Saving Private Ryan"
];

async function seed() {
    await dbConnection();

    // Clear existing flashcards
    await Flashcard.deleteMany({});
    console.log("🗑️ Cleared existing flashcards");

    for (const title of movieTitles) {
        const res = await fetch(
            `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`
        );
        const movie = await res.json();

        if (movie.Response === "True") {
            await Flashcard.create({
                title: movie.Title,
                description: movie.Plot
            });
            console.log(`✅ Added: ${movie.Title}`);
        } else {
            console.log(`❌ Not found: ${title}`);
        }
    }

    console.log("🌱 Seeding complete!");
    process.exit();
}

seed();