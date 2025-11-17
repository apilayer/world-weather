# World Weather Dashboard (Frontend)

Modern single-page weather dashboard built with React and Vite. The UI consumes the companion backend proxy (see `../backend`) to securely query Weatherstack and showcase rich weather insights such as current conditions, multi-day forecasts, air quality, and detailed metrics.

## Features

- 🎯 **Preset & custom locations:** Quick-switch list with persistence in `localStorage`, add/remove/search flows.
- 🌡 **Current weather snapshot:** Temperature, “feels like”, wind, humidity, visibility, and UV index cards.
- 📅 **5-day forecast strip:** Icons, highs/lows, and graceful fallback when only current data is available.
- 🌫 **Air quality & details:** Air quality breakdown plus sunrise, sunset, moon phase, precipitation, etc.
- 🔄 **Smart caching:** In-memory cache with TTL to avoid duplicate fetches and handle rate limits gracefully.
- ⚠️ **Resilient UX:** Sample data mode, inline status messages, and status bar showing provider state.

![App Screenshot](../_assets/frontend-preview.png)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend proxy running on `http://localhost:4000` (default from `../backend`)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy `.env.example` → `.env` and adjust as needed:

```
VITE_API_BASE_URL=http://localhost:4000
```

You may point `VITE_API_BASE_URL` to any deployed backend proxy URL.

### Available Scripts

| Command          | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Start Vite dev server with HMR (default port 5173).   |
| `npm run build`  | Generate production build in `dist/`.                 |
| `npm run preview`| Preview the production build locally.                 |
| `npm run lint`   | Run ESLint using the shared config.                   |

During development, start the backend (`npm run dev` in `../backend`) first so API calls succeed.

## Project Structure

```
frontend/
├─ src/
│  ├─ components/      # Core UI pieces (cards, sidebar, title/status bars)
│  ├─ data/            # Sample payloads used for offline fallback
│  ├─ App.jsx          # Main layout & orchestration logic
│  ├─ main.jsx         # Vite/React entry point
│  └─ index.css        # Tailwind layers + base styles
├─ public/             # Static assets served as-is
└─ tailwind.config.js  # Tailwind theme configuration
```

Notable implementation details live in `src/App.jsx`, including:

- Fetch orchestration with caching (`weatherCacheRef`, `CACHE_TTL_MS`)
- Forecast fallback generator when Weatherstack plan lacks forecast access
- Local storage hydration and persistence for user locations
- Derived helpers for formatting units (temperature, visibility, precipitation)

## API Expectations

The frontend calls `${VITE_API_BASE_URL}/api/weather/{endpoint}` with parameters:

- `endpoint`: `forecast` (primary) or `current` fallback
- `query`: location name/value
- `forecast_days`, `hourly`: when forecast access is available

Responses should align with Weatherstack’s structure. When limited to current weather, the frontend synthesizes a basic forecast.

## Styling & UI

- TailwindCSS for utility-first styling, with an Inter font stack.
- Responsive-friendly layout for the main dashboard width (optimized for desktop viewport).
- The UI renders sample data instantly, then transitions to live data when the backend returns.

## Development Tips

- Use browser devtools’ network tab to inspect requests to `/api/weather/*`.
- Toggle units via the °F/°C buttons (state stored in React).
- Weatherstack rate limits apply; rely on sample data when quotas hit.
- If you change the backend port, remember to update `VITE_API_BASE_URL`.

## Deployment

1. Run `npm run build` to create the production bundle in `dist/`.
2. Serve the contents of `dist/` with any static host (Netlify, Vercel, S3, etc.).
3. Ensure the deployed site can reach the backend proxy (configure CORS appropriately).

## License

MIT © Pratham – see root project license for details.
