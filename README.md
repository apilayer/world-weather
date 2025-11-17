# World Weather Dashboard

Full-stack Weatherstack client built with a React/Tailwind frontend and an Express proxy backend. The project keeps the Weatherstack API key on the server while offering a polished dashboard for multiple locations, forecasts, air quality metrics, and detailed weather insights.

## Project Structure

```
world-weather/
├─ frontend/   # React + Vite SPA (UI, caching, formatting helpers)
├─ backend/    # Express proxy that signs Weatherstack requests
└─ _assets/    # Design references and documentation artifacts
```

## Getting Started

1. Install dependencies in both `frontend` and `backend` folders (`npm install`).
2. Copy each `.env.example` to `.env` and fill required values (Weatherstack key for backend, API base URL for frontend).
3. Start the backend (`npm run dev` from `backend/`), then start the frontend (`npm run dev` from `frontend/`).
4. Visit the Vite dev server (default `http://localhost:5173`) to interact with the dashboard.

## Documentation

- Frontend details: see [frontend/README.md](frontend/README.md)
- Backend details: see [backend/README.md](backend/README.md)
