const TitleBar = () => (
  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
    <div className="flex items-center space-x-2">
      <div className="flex space-x-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <h1 className="text-white text-sm font-medium ml-4">Weather Forecast</h1>
    </div>
    <div className="flex items-center space-x-4 text-gray-400">
      <button
        type="button"
        className="hover:text-white transition-colors"
        aria-label="Expand"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      <button
        type="button"
        className="hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

export default TitleBar;
