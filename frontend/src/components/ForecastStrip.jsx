const ForecastStrip = ({ days, isSample }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-white text-md font-medium">5-Day Forecast</h3>
      <span className="text-xs text-blue-200 uppercase tracking-wide">Daily highs & lows</span>
    </div>
    {isSample && (
      <p className="text-xs text-blue-200/80 mb-2">
        Forecast data is estimated because this Weatherstack plan does not include extended forecasts.
      </p>
    )}
    {days.length === 0 ? (
      <p className="text-sm text-blue-200">Forecast data is not available for this location.</p>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {days.map((day) => (
          <div key={day.label} className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-blue-200 text-sm">{day.label}</p>
            <div className="my-2 flex items-center justify-center text-white">{day.icon}</div>
            <p className="text-white text-sm font-medium">{day.high}°</p>
            <p className="text-blue-300 text-xs">{day.low}°</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ForecastStrip;
