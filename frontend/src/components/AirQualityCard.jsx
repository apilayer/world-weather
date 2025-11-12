const AirQualityCard = ({ indexValue, statusLabel, metricBreakdown }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white text-md font-medium">Air Quality</h3>
      <span className="text-xs text-green-300 bg-green-300/20 px-2 py-1 rounded-full">{statusLabel}</span>
    </div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-blue-200 text-sm">Air Quality Index</span>
      <span className="text-white text-sm font-medium">{indexValue ?? '--'}</span>
    </div>
    <div className="w-full bg-blue-200/30 rounded-full h-1.5 mb-4">
      <div
        className="bg-green-300 h-1.5 rounded-full transition-all"
        style={{ width: Math.min(Number(indexValue || 0) * 10, 100) + '%' }}
      />
    </div>
    <div className="grid grid-cols-3 gap-2 text-center mt-3">
      {metricBreakdown.map((metric) => (
        <div key={metric.label} className="bg-blue-900/30 rounded-lg p-2">
          <p className="text-blue-200 text-xs uppercase tracking-wide">{metric.label}</p>
          <p className="text-white text-sm font-medium mt-1">{metric.value ?? '--'}</p>
        </div>
      ))}
    </div>
  </div>
);

export default AirQualityCard;
