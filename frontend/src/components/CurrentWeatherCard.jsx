const MetricRow = ({ icon, label, value }) => (
  <div className="flex items-center">
    <div className="bg-blue-500/20 rounded-full p-2 mr-3 text-blue-300">
      {icon}
    </div>
    <div>
      <p className="text-blue-200 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  </div>
);

const CurrentWeatherCard = ({ iconUrl, temperature, unitLabel, description, feelsLike, metrics }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 flex flex-col lg:flex-row items-center">
    <div className="flex items-center w-full lg:w-auto">
      {iconUrl ? (
        <img src={iconUrl} alt={description || 'Current conditions'} className="w-24 h-24" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      )}
      <div className="ml-4">
        <div className="flex items-baseline">
          <span className="text-5xl font-light text-white">{temperature ?? '--'}</span>
          <span className="ml-2 text-blue-200 text-lg">{unitLabel.toUpperCase()}</span>
        </div>
        <p className="text-blue-200 text-xl">{description || '—'}</p>
        <p className="text-blue-200/80 text-sm">Feels like {feelsLike ?? '--'}°</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 ml-auto mt-6 lg:mt-0 lg:ml-auto w-full lg:w-auto">
      {metrics.map((metric) => (
        <MetricRow key={metric.label} icon={metric.icon} label={metric.label} value={metric.value} />
      ))}
    </div>
  </div>
);

export default CurrentWeatherCard;
