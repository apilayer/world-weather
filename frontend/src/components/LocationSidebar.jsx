import { useState } from 'react';

const LocationSidebar = ({
  locations,
  activeLocationId,
  onSelectLocation,
  onSearchSubmit,
  onDeleteLocation,
  lastUpdatedLabel,
  onRefresh,
  isRefreshing,
  activeTemperatureDisplay,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }
    onSearchSubmit(query.trim());
    setQuery('');
  };

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <h2 className="text-white font-medium">Locations</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="location-search" className="sr-only">
          Search for a city
        </label>
        <div className="flex items-center bg-gray-700/60 rounded-md px-2 py-1.5 border border-gray-600 focus-within:border-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.15a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
          </svg>
          <input
            id="location-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </form>

      <div className="space-y-2 overflow-y-auto pr-1 flex-1">
        {locations.map((location) => {
          const isActive = location.id === activeLocationId;
          const temperatureLabel = isActive && activeTemperatureDisplay ? `${activeTemperatureDisplay}°` : location.tempHint;
          const disableDelete = locations.length <= 1;

          return (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelectLocation(location)}
              className={`w-full rounded-md p-2 flex items-center justify-between transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/80'
              }`}
            >
              <span className="text-sm font-medium truncate">{location.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{temperatureLabel ?? '--'}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (disableDelete) {
                      return;
                    }
                    const shouldDelete =
                      typeof window === 'undefined' || window.confirm(`Remove ${location.label} from your locations?`);
                    if (shouldDelete) {
                      onDeleteLocation(location.id);
                    }
                  }}
                  disabled={disableDelete}
                  className="text-gray-400 hover:text-white disabled:opacity-40"
                  aria-label={`Delete ${location.label}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5l.867 10.404A2.25 2.25 0 009.11 20.25h5.78a2.25 2.25 0 002.244-2.346L18 7.5m-9 0V5.25A1.5 1.5 0 0110.5 3.75h3a1.5 1.5 0 011.5 1.5V7.5m-9 0h10.5" />
                  </svg>
                </button>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700 text-sm text-gray-400">
        <div className="flex items-center justify-between mb-2">
          <span>Last updated</span>
          <span>{lastUpdatedLabel}</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white rounded-md py-2 text-sm mt-4 flex items-center justify-center transition-colors"
        >
          {isRefreshing ? (
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l3.5-3.5L12 0v3a9 9 0 00-9 9h1z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          )}
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>
    </aside>
  );
};

export default LocationSidebar;
