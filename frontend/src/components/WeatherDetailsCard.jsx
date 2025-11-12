const WeatherDetailsCard = ({ title = 'Weather Details', rows }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
    <h3 className="text-white text-md font-medium mb-4">{title}</h3>
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between items-center">
          <span className="text-blue-200 text-sm">{row.label}</span>
          <span className="text-white text-sm font-medium">{row.value ?? '--'}</span>
        </div>
      ))}
    </div>
  </div>
);

export default WeatherDetailsCard;
