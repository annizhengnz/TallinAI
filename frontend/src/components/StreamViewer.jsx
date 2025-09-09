import { useState, useEffect } from 'react';

const StreamViewer = () => {
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const fetchResults = async () => {
    setImages([]);
    setVideo(null);
    setError(null);
    setIsComplete(false);
    setLoading(true);

    try {
      const eventSource = new EventSource('http://127.0.0.1:5000/api/v1/result');

      eventSource.onopen = () => {
        console.log('Connection opened');
      };

      eventSource.addEventListener('connect', (e) => {
        console.log('Connected:', e.data);
      });

      eventSource.addEventListener('image', (e) => {
        const imageData = JSON.parse(e.data);
        setImages(prev => [...prev, imageData]);
      });

      eventSource.addEventListener('video', (e) => {
        const videoData = JSON.parse(e.data);
        console.log(videoData)
        setVideo(videoData);
      });

      eventSource.addEventListener('error', (e) => {
        console.error('Stream error:', e);
        setError(e.data || 'An error occurred while fetching results');
        setLoading(false);
        eventSource.close();
      });

      eventSource.addEventListener('complete', (e) => {
        console.log('Stream complete:', e.data);
        setLoading(false);
        setIsComplete(true);
        eventSource.close();
      });

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setError('Connection error. Please try again.');
        setLoading(false);
        eventSource.close();
      };

    } catch (err) {
      console.error('Setup error:', err);
      setError('Failed to connect to the server');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    return () => {
      const existingEventSource = new EventSource('/api/v1/query');
      if (existingEventSource) {
        existingEventSource.close();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Control Panel */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Results Viewer</h2>
        <button 
          onClick={fetchResults} 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Loading...' : 'Refresh Results'}
        </button>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
          Loading results from server...
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {isComplete && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Complete! Found {images.length} images and {video ? '1 video' : 'no videos'}
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {images.map((image, index) => (
          <div key={index} className="border rounded-lg overflow-hidden bg-white shadow">
            <img
              src={image.url}
              alt={image.description}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold mb-2">{image.description}</h3>
              <div className="text-sm text-gray-600">
                <p>Format: {image.metadata.format}</p>
                <p>Size: {(image.metadata.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player */}
      {video && (
        <div className="border rounded-lg overflow-hidden bg-white shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Video</h2>
          <video 
            controls 
            className="w-full max-h-96 object-contain bg-black"
            src={video.url}
          >
            Your browser does not support the video tag.
          </video>
          <div className="mt-4 text-sm text-gray-600">
            <p>Filename: {video.filename}</p>
            <p>Format: {video.format}</p>
            <p>Size: {(video.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamViewer;