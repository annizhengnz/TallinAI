import React, { useState } from 'react';

const RTSPViewer = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState(null);
  
  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const handleImageError = (e) => {
    setError("Stream connection lost. Please check the connection and try again.");
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800">RTSP Stream Viewer</h2>
          <button
            onClick={toggleStream}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
              isStreaming 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Stream Container */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {isStreaming ? (
              <img
                src="http://192.168.128.134:6210/webcam"
                alt="RTSP Stream"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Stream Stopped
              </div>
            )}
          </div>
          
          {/* Info Grids */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTSPViewer;