# Weatherstack Proxy Backend

Small Express server that forwards requests to the Weatherstack API so the API key never leaves the backend. The proxy is based on the capabilities described in `_assets/docs.txt`.

## Setup

1. Copy `.env.example` to `.env` and fill in `WEATHERSTACK_API_KEY` with the secret from your Weatherstack dashboard.
2. Install dependencies (already done in this repo, but run again if needed):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The proxy listens on `http://localhost:4000` by default.

## API

`GET /api/weather/:endpoint?`

- `:endpoint` is optional (defaults to `current`). Valid values include `current`, `historical`, `forecast`, etc. matching the Weatherstack endpoints mentioned in `_assets/docs.txt`.
- Any other query string parameters are passed through to Weatherstack (e.g. `query`, `historical_date`, `units`, `language`, etc.).

Example request that mirrors `http://api.weatherstack.com/current?access_key=...&query=New York`:

```
GET http://localhost:4000/api/weather/current?query=New%20York
```

### Health Check

`GET /health` responds with `{ "status": "ok" }`.

## Notes

- The proxy strips any `access_key` parameter sent from the client, ensuring the server-side key is always used.
- You can override `WEATHERSTACK_BASE_URL` or `WEATHERSTACK_TIMEOUT_MS` in `.env` if needed.
