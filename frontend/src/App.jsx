import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import TitleBar from './components/TitleBar';
import LocationSidebar from './components/LocationSidebar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastStrip from './components/ForecastStrip';
import AirQualityCard from './components/AirQualityCard';
import WeatherDetailsCard from './components/WeatherDetailsCard';
import StatusBar from './components/StatusBar';
import sampleWeather from './data/sampleWeather.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const PRESET_LOCATIONS = [
  { id: 'new-york', label: 'New York', query: 'New York', tempHint: '72°' },
  { id: 'san-francisco', label: 'San Francisco', query: 'San Francisco', tempHint: '64°' },
  { id: 'los-angeles', label: 'Los Angeles', query: 'Los Angeles', tempHint: '78°' },
  { id: 'chicago', label: 'Chicago', query: 'Chicago', tempHint: '65°' },
  { id: 'miami', label: 'Miami', query: 'Miami', tempHint: '86°' },
];

const formatTemperature = (value, unit) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return null;
  }
  return unit === 'f' ? Math.round((numericValue * 9) / 5 + 32) : Math.round(numericValue);
};

const formatWindSpeed = (speedKph, unit) => {
  const numericSpeed = typeof speedKph === 'number' ? speedKph : Number(speedKph);
  if (Number.isNaN(numericSpeed)) {
    return '--';
  }
  return unit === 'f' ? `${Math.round(numericSpeed / 1.609)} mph` : `${Math.round(numericSpeed)} km/h`;
};

const formatVisibility = (visibilityKm, unit) => {
  const numericVisibility = typeof visibilityKm === 'number' ? visibilityKm : Number(visibilityKm);
  if (Number.isNaN(numericVisibility)) {
    return '--';
  }
  return unit === 'f' ? `${Math.round(numericVisibility / 1.609)} mi` : `${Math.round(numericVisibility)} km`;
};

const formatPrecipitation = (valueMm, unit) => {
  const numericValue = typeof valueMm === 'number' ? valueMm : Number(valueMm);
  if (Number.isNaN(numericValue)) {
    return '--';
  }
  return unit === 'f' ? `${(numericValue / 25.4).toFixed(2)} in` : `${numericValue.toFixed(1)} mm`;
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '—';
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return '—';
  const diff = Date.now() - parsed.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} hr ago`;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getLocalDateTime = (localtime) => {
  if (!localtime) {
    return { dateLabel: '', timeLabel: '' };
  }
  const safeString = localtime.replace(' ', 'T');
  const date = new Date(safeString);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '', timeLabel: '' };
  }
  return {
    dateLabel: date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    timeLabel: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
};

const determineAirQualityStatus = (index) => {
  const statusMap = {
    1: 'Good',
    2: 'Moderate',
    3: 'Sensitive',
    4: 'Unhealthy',
    5: 'Very unhealthy',
    6: 'Hazardous',
  };
  return statusMap[index] || 'Unknown';
};

const buildForecastIcon = (condition = '') => {
  const normalized = condition.toLowerCase();
  if (normalized.includes('rain')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 13v5m-4-5v5m-4-5v5m14-7a4 4 0 00-3.647-3.977 5.002 5.002 0 00-9.705-1.514A4 4 0 003 11a4 4 0 004 4h12a4 4 0 004-4z" />
      </svg>
    );
  }
  if (normalized.includes('cloud')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15A4.5 4.5 0 006.75 19.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848A5.25 5.25 0 005.34 10.725 4.5 4.5 0 002.25 15z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_FORECAST_OFFSETS = [-2, -1, 0, 1, 2];
const STORAGE_KEYS = {
  LOCATIONS: 'weather-ui::locations',
  SELECTED: 'weather-ui::selected-location',
};

const normalizeQuery = (value) => value.trim().toLowerCase();

const formatISODate = (date) => date.toISOString().slice(0, 10);

const generateFallbackForecast = (currentPayload) => {
  const baseTemp = Number(currentPayload.current?.temperature ?? 20);
  const baseWind = Number(currentPayload.current?.wind_speed ?? 10);
  const baseHumidity = Number(currentPayload.current?.humidity ?? 60);
  const description = currentPayload.current?.weather_descriptions?.[0] ?? 'Partly cloudy';
  const locationTime = currentPayload.location?.localtime;
  const baseDate = locationTime ? new Date(locationTime.replace(' ', 'T')) : new Date();

  return DEFAULT_FORECAST_OFFSETS.reduce((forecastAcc, offset, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(dayDate.getDate() + index);

    const maxTemp = Math.round(baseTemp + offset + 3);
    const minTemp = Math.round(baseTemp + offset - 3);
    const avgTemp = Math.round((maxTemp + minTemp) / 2);
    const chanceOfRain = Math.min(90, Math.max(10, baseHumidity + offset * 5));

    forecastAcc[formatISODate(dayDate)] = {
      date: formatISODate(dayDate),
      maxtemp: maxTemp,
      mintemp: minTemp,
      avgtemp: avgTemp,
      sunhour: '9.5',
      astro: {
        sunrise: '06:45 AM',
        sunset: '07:10 PM',
        moonrise: '11:00 PM',
        moonset: '11:00 AM',
        moon_phase: 'Waning Gibbous',
        moon_illumination: '65',
      },
      hourly: [
        {
          time: '1200',
          temperature: avgTemp,
          weather_descriptions: [description],
          wind_speed: Math.max(5, Math.round(baseWind + offset)),
          wind_dir: currentPayload.current?.wind_dir ?? 'N',
          pressure: currentPayload.current?.pressure ?? 1012,
          humidity: Math.max(20, Math.min(100, Math.round(baseHumidity + offset * 3))),
          visibility: currentPayload.current?.visibility ?? 10,
          chanceofrain: String(Math.round(chanceOfRain)),
        },
      ],
    };

    return forecastAcc;
  }, {});
};

const persistUserLocations = (nextLocations, selectedId) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(nextLocations));
    if (selectedId) {
      window.localStorage.setItem(STORAGE_KEYS.SELECTED, selectedId);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.SELECTED);
    }
  } catch (storageError) {
    console.warn('Unable to persist locations to storage.', storageError);
  }
};

function App() {
  const [locations, setLocations] = useState(PRESET_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState(sampleWeather);
  const [isSampleData, setIsSampleData] = useState(true);
  const [isForecastSample, setIsForecastSample] = useState(true);
  const [units, setUnits] = useState('f');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const weatherCacheRef = useRef({});

  const requestWeather = useCallback(async (endpoint, query, params = {}) => {
    const { data } = await axios.get(`${API_BASE_URL}/api/weather/${endpoint}`, {
      params: {
        query,
        ...params,
      },
    });

    if (data?.success === false) {
      const requestError = new Error(data?.error?.info || 'Weatherstack reported an error.');
      requestError.code = data?.error?.code;
      requestError.type = data?.error?.type;
      throw requestError;
    }

    if (typeof data?.error === 'string' && !data?.location) {
      throw new Error(data.error);
    }

    return data;
  }, []);

  const applyWeatherPayload = useCallback(
    (payload, { sampleData = false, sampleForecast = false, timestamp = new Date().toISOString() } = {}) => {
      setWeatherData(payload);
      setIsSampleData(sampleData);
      setIsForecastSample(sampleForecast);
      setLastUpdated(timestamp);
    },
    [],
  );

  const fetchWeather = useCallback(
    async (query) => {
      const cacheKey = normalizeQuery(query);
      const cachedEntry = weatherCacheRef.current[cacheKey];
      if (cachedEntry && Date.now() - cachedEntry.timestampMs < CACHE_TTL_MS) {
        applyWeatherPayload(cachedEntry.payload, {
          ...cachedEntry.meta,
          timestamp: cachedEntry.timestampIso,
        });
        setError(cachedEntry.errorMessage || '');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        try {
          const forecastPayload = await requestWeather('forecast', query, { forecast_days: 5, hourly: 1 });
          const timestampIso = new Date().toISOString();
          const meta = { sampleData: false, sampleForecast: false, timestamp: timestampIso };
          applyWeatherPayload(forecastPayload, meta);
          weatherCacheRef.current[cacheKey] = {
            payload: forecastPayload,
            meta,
            timestampMs: Date.now(),
            timestampIso,
            errorMessage: '',
          };
          return;
        } catch (forecastError) {
          console.warn('Forecast endpoint failed, attempting current weather fallback.', forecastError);
        }

        try {
          const currentPayload = await requestWeather('current', query);
          const syntheticForecast = generateFallbackForecast(currentPayload);
          const fallbackPayload = {
            ...currentPayload,
            forecast: syntheticForecast,
          };
          const timestampIso = new Date().toISOString();
          const meta = { sampleData: false, sampleForecast: true, timestamp: timestampIso };
          const fallbackMessage = 'Limited forecast data available on this plan. Showing estimated forecast.';
          applyWeatherPayload(fallbackPayload, meta);
          setError(fallbackMessage);
          weatherCacheRef.current[cacheKey] = {
            payload: fallbackPayload,
            meta,
            timestampMs: Date.now(),
            timestampIso,
            errorMessage: fallbackMessage,
          };
          return;
        } catch (currentError) {
          console.error(currentError);
          const timestampIso = new Date().toISOString();
          const meta = { sampleData: true, sampleForecast: true, timestamp: timestampIso };
          applyWeatherPayload(sampleWeather, meta);
          const message = currentError.message || 'Unable to load weather data. Showing sample data.';
          setError(message);
          weatherCacheRef.current[cacheKey] = {
            payload: sampleWeather,
            meta,
            timestampMs: Date.now(),
            timestampIso,
            errorMessage: message,
          };
        }
      } finally {
        setIsLoading(false);
      }
    },
    [applyWeatherPayload, requestWeather],
  );

  useEffect(() => {
    fetchWeather(selectedLocation.query);
  }, [fetchWeather, selectedLocation.query]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedLocationsRaw = window.localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      const storedLocations = storedLocationsRaw ? JSON.parse(storedLocationsRaw) : null;
      if (Array.isArray(storedLocations) && storedLocations.length) {
        setLocations(storedLocations);
        const storedSelectedId = window.localStorage.getItem(STORAGE_KEYS.SELECTED);
        const fallbackSelection =
          storedLocations.find((location) => location.id === storedSelectedId) ?? storedLocations[0];
        setSelectedLocation(fallbackSelection);
      }
    } catch (storageError) {
      console.warn('Unable to hydrate locations from storage.', storageError);
    }
  }, []);

  const handleSearchSubmit = (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    const existing = locations.find((location) => location.query.toLowerCase() === normalizedQuery.toLowerCase());
    if (existing) {
      setSelectedLocation(existing);
      persistUserLocations(locations, existing.id);
      return;
    }

    const nextLocation = {
      id: normalizedQuery.toLowerCase().replace(/\s+/g, '-'),
      label: normalizedQuery,
      query: normalizedQuery,
      tempHint: '--',
    };
    const nextLocations = [nextLocation, ...locations];
    setLocations(nextLocations);
    setSelectedLocation(nextLocation);
    persistUserLocations(nextLocations, nextLocation.id);
  };

  const handleDeleteLocation = (locationId) => {
    if (locations.length <= 1) {
      return;
    }

    const filtered = locations.filter((location) => location.id !== locationId);
    if (filtered.length === locations.length || filtered.length === 0) {
      return;
    }

    const nextSelection = selectedLocation.id === locationId ? filtered[0] : selectedLocation;
    setLocations(filtered);
    setSelectedLocation(nextSelection);
    persistUserLocations(filtered, nextSelection?.id);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    persistUserLocations(locations, location.id);
  };

  const { dateLabel, timeLabel } = getLocalDateTime(weatherData.location?.localtime);

  const sortedForecastEntries = useMemo(() => {
    if (!weatherData.forecast) return [];
    return Object.values(weatherData.forecast).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weatherData.forecast]);

  const forecastDays = useMemo(
    () =>
      sortedForecastEntries.slice(0, 5).map((day) => {
        const condition = day.hourly?.[0]?.weather_descriptions?.[0];
        return {
          label: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
          high: formatTemperature(day.maxtemp, units) ?? '--',
          low: formatTemperature(day.mintemp, units) ?? '--',
          icon: buildForecastIcon(condition),
        };
      }),
    [sortedForecastEntries, units],
  );

  const current = weatherData.current ?? {};
  const todaysForecast = sortedForecastEntries[0];
  const astro =
    todaysForecast?.astro ||
    current.astro || {
      sunrise: '--',
      sunset: '--',
      moon_phase: '--',
    };

  const currentTemperature = formatTemperature(current.temperature, units);
  const feelsLike = formatTemperature(current.feelslike, units);
  const wind = formatWindSpeed(current.wind_speed, units);
  const visibility = formatVisibility(current.visibility, units);
  const uvIndexValue = Number(current.uv_index);
  const uvIndexText = Number.isNaN(uvIndexValue) ? '--' : `${uvIndexValue} ${uvIndexValue < 3 ? '(Low)' : '(High)'}`;
  const humidityValue = Number(current.humidity);
  const humidityText = Number.isNaN(humidityValue) ? '--' : `${humidityValue}%`;

  const currentMetrics = [
    {
      label: 'Wind',
      value: wind,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
    },
    {
      label: 'UV Index',
      value: uvIndexText,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: 'Humidity',
      value: humidityText,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a8.25 8.25 0 0116.5 0 8.25 8.25 0 01-16.5 0z" />
        </svg>
      ),
    },
    {
      label: 'Visibility',
      value: visibility,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const airQuality = current.air_quality || {};
  const airQualityRows = [
    { label: 'PM2.5', value: airQuality.pm2_5 ? `${airQuality.pm2_5} μg/m³` : '--' },
    { label: 'PM10', value: airQuality.pm10 ? `${airQuality.pm10} μg/m³` : '--' },
    { label: 'O₃', value: airQuality.o3 ? `${airQuality.o3} ppb` : '--' },
  ];

  const weatherDetails = [
    { label: 'Precipitation', value: formatPrecipitation(current.precip, units) },
    { label: 'Pressure', value: current.pressure ? `${current.pressure} hPa` : '--' },
    { label: 'Sunrise', value: astro.sunrise || '--' },
    { label: 'Sunset', value: astro.sunset || '--' },
    { label: 'Moon Phase', value: astro.moon_phase || '--' },
    {
      label: 'Chance of Rain',
      value: todaysForecast?.hourly?.[0]?.chanceofrain ? `${todaysForecast.hourly[0].chanceofrain}%` : '--',
    },
  ];

  const lastUpdatedLabel = formatRelativeTime(lastUpdated);
  const providerMessage = isSampleData ? 'Weather data provided by sample Weatherstack payload' : 'Weather data provided by Weatherstack';
  const statusDetail = isSampleData ? 'Offline (sample)' : isForecastSample ? 'Partial (forecast sample)' : 'Online';

  const activeTemperatureDisplay = typeof currentTemperature === 'number' ? currentTemperature : null;

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col font-inter">
      <div className="bg-yellow-100 text-yellow-900 text-xs sm:text-sm text-center py-2 px-4 shadow-sm">
        <a
          href="https://weatherstack.com/"
          target="_blank"
          rel="noreferrer"
          className="font-medium hover:text-yellow-800 transition-colors"
        >
          This app is built using the Weatherstack API.
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-[800px] h-[600px] bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700 flex flex-col">
          <TitleBar />
          <div className="flex flex-1 overflow-hidden">
            <LocationSidebar
              locations={locations}
              activeLocationId={selectedLocation.id}
              onSelectLocation={handleSelectLocation}
              onSearchSubmit={handleSearchSubmit}
              onDeleteLocation={handleDeleteLocation}
              lastUpdatedLabel={lastUpdatedLabel}
              onRefresh={() => fetchWeather(selectedLocation.query)}
              isRefreshing={isLoading}
              activeTemperatureDisplay={activeTemperatureDisplay}
            />
            <main className="flex-1 bg-gradient-to-b from-blue-900 to-indigo-900 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-white text-2xl font-semibold">{selectedLocation.label || weatherData.location?.name}</h1>
                    <p className="text-blue-200 text-sm">
                      {dateLabel}
                      {timeLabel ? ` • ${timeLabel}` : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {['f', 'c'].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setUnits(unit)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          units === unit ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        °{unit.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-100 text-sm rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <CurrentWeatherCard
                  iconUrl={current.weather_icons?.[0]}
                  temperature={currentTemperature}
                  unitLabel={units}
                  description={current.weather_descriptions?.[0]}
                  feelsLike={feelsLike}
                  metrics={currentMetrics}
                />

                <ForecastStrip days={forecastDays} isSample={isForecastSample} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AirQualityCard
                    indexValue={airQuality['us-epa-index']}
                    statusLabel={determineAirQualityStatus(Number(airQuality['us-epa-index']))}
                    metricBreakdown={airQualityRows}
                  />
                  <WeatherDetailsCard rows={weatherDetails} />
                </div>
              </div>
            </main>
          </div>
          <StatusBar providerLabel={providerMessage} isOnline={!isSampleData} statusDetail={statusDetail} />
        </div>
      </div>
    </div>
  );
}

export default App;
