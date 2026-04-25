# MovieNow

A full-stack MERN application for browsing movies, generating AI-generated reviews, chatting with AI, tracking completion times, and more.

## Features

- User registration, login, and profile management (JWT auth)
- Movie search and IMDb top-rated browsing (OMDB API)
- AI-generated movie reviews (Google Gemini) with 30s cooldown rate limiting
- Movie-scoped chat — ask questions about any film, answered by a Gemini-powered AI constrained to that movie
- Movie plot summaries
- Completion time tracking per user
- Cinema search (MovieGlu API)
- Game page with score tracking and stopwatch

## Tech Stack

- **Frontend**: React 18, React Router 6, React Bootstrap, Tailwind CSS, Axios
- **Backend**: Node.js, Express 4, Mongoose, Zod, JWT, bcrypt
- **Database**: MongoDB Atlas
- **External APIs**: OMDB, Google Gemini, MovieGlu

## Setup

### Environment Variables

**Backend** (`backend/server/.env`):
```
DB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
ACCESS_TOKEN_SECRET=<your jwt secret>
OMDB_API_KEY=<your omdb key>
GEMINI_API_KEY=<your gemini key>
```

**Frontend** (`frontend/.env`):
```
PORT=8096
REACT_APP_BACKEND_SERVER_URI=http://localhost:8081
```

### Running Locally

```bash
# Backend (port 8081)
cd backend/server && npm install && npm run server

# Frontend (port 8096)
cd frontend && npm install && npm start
```

Both must be running simultaneously.

## Project Structure

```
frontend/               React app (port 8096)
  src/
    App.js              Router + UserContext + LastMovieContext
    components/pages/   Page components
    utilities/          JWT decode helper
    css/                Component styles

backend/server/         Express API (port 8081)
  server.js             Entry point, route registration
  routes/               One file per endpoint
  models/               Mongoose schemas, Zod validators, AIReviewCache
  config/               MongoDB connection
  utilities/            JWT token generation, shared Gemini utilities (geminiUtils.js)
  test/                 Manual REST tests + Jest unit tests
```

## API Routes

| Prefix | Description |
|---|---|
| `/user` | Auth, profile, AI reviews, zip code |
| `/completion-times` | CRUD for user completion times |
| `/scores` | User scores |
| `/movies` | Search, top-rated, plot summaries, movie chat |
| `/movieglu` | Cinema data |

## Testing

- **Backend unit tests**: `cd backend/server && npm test` (Jest, 62 tests covering movie search, top-rated, AI review, movie chat, and shared Gemini utilities — zero mocks)
- **Manual REST tests**: `backend/server/test/manual-rest-tests/*.rest` (VS Code REST Client)
- **Frontend**: `cd frontend && npm test` (Jest + React Testing Library)
