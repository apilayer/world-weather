require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const WEATHERSTACK_API_KEY = process.env.WEATHERSTACK_API_KEY;
const WEATHERSTACK_BASE_URL = process.env.WEATHERSTACK_BASE_URL || 'http://api.weatherstack.com';

if (!WEATHERSTACK_API_KEY) {
  console.warn('Warning: WEATHERSTACK_API_KEY is not set. Requests to Weatherstack will fail.');
}

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/weather/:endpoint?', async (req, res) => {
  const endpoint = (req.params.endpoint || req.query.endpoint || 'current').toLowerCase();

  if (!WEATHERSTACK_API_KEY) {
    return res.status(500).json({ error: 'Missing WEATHERSTACK_API_KEY on the server.' });
  }

  const url = `${WEATHERSTACK_BASE_URL}/${endpoint}`;
  const params = new URLSearchParams({ access_key: WEATHERSTACK_API_KEY });

  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key === 'endpoint' || key === 'access_key' || typeof value === 'undefined') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.append(key, value);
    }
  });

  try {
    const response = await axios.get(`${url}?${params.toString()}`, {
      timeout: Number(process.env.WEATHERSTACK_TIMEOUT_MS) || 10_000,
    });

    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: 'Unable to fetch data from Weatherstack.',
      details: error.response?.data || error.message,
    });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Weather proxy listening on http://localhost:${PORT}`);
});
