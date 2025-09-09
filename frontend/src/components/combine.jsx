import React, { useState } from 'react';

const CombinedViewer = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // RTSP Handlers
  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const handleStreamError = () => {
    setError("Stream connection lost. Please check the connection and try again.");
    setIsStreaming(false);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsQueryLoading(true);
    setError('');
    setQueryResponse(null);

    try {
      const queryData = {
        query: query,
        model: e.target.querySelector('select').value
      };
      
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/query?query=${encodeURIComponent(queryData.query)}&model=${encodeURIComponent(queryData.model)}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      setQueryResponse(data);
    } catch (err) {
      console.error('Query error:', err);
      setError('Query error: ' + err.message);
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">RTSP Stream Viewer</h1>
          <p className="text-gray-600 mt-2">Live video stream with real-time analytics</p>
        </div>

        {/* Stream Controls */}
        <div className="flex justify-end">
          <button
            onClick={toggleStream}
            className={`px-4 py-2 rounded-md text-white ${
              isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </button>
        </div>

        {/* Stream Display */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {isStreaming ? (
            <img
              src="http://192.168.128.134:6210/webcam"
              alt="RTSP Stream"
              className="w-full h-full object-contain"
              onError={handleStreamError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Stream Stopped
            </div>
          )}
        </div>

        {/* Query Form */}
        <form onSubmit={handleQuerySubmit} className="space-y-4 pt-4 border-t">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your query about the stream..."
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              defaultValue="CLIP"
            >
              <option value="CLIP">CLIP</option>
              <option value="Llama">Llama</option>
            </select>
            <button
              type="submit"
              disabled={!query.trim() || isQueryLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                flex items-center gap-2"
            >
              {isQueryLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </form>
              
        {/* Info Grids */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Stream Information</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Resolution: 1920x1080</p>
              <p className="text-gray-600">Format: RTSP over UDP</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Processing Status</h3>
            <div className="space-y-2">
              <p className="text-gray-600">OpenCV Detection Active</p>
              <p className="text-gray-600">Processing Rate: Real-time</p>
              <p className="text-gray-600">Stream Health: Good</p>
            </div>
          </div>
        </div> */}

        {/* Query Response */}
        {queryResponse && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">Analysis Results:</h3>
            <pre className="text-sm text-blue-700 overflow-auto">
              {queryResponse.message}
            </pre>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="border rounded-lg p-4 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombinedViewer;