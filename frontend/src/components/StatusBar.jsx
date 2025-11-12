const StatusBar = ({ providerLabel, isOnline, statusDetail }) => (
  <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex justify-between items-center text-xs text-gray-400">
    <div>{providerLabel}</div>
    <div className="flex items-center space-x-2">
      <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-400'}`} />
      <span>{statusDetail}</span>
    </div>
  </div>
);

export default StatusBar;
