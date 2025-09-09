import React, { useEffect, useRef } from 'react';
import { loadPlayer } from 'rtsp-relay/browser';

const RTSPPlayer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initPlayer = async () => {
      try {
        await loadPlayer({
          url: 'ws://localhost:8765',
          canvas: canvasRef.current,
          onDisconnect: () => {
            console.log('Connection lost!');
            // You can add additional disconnect handling here
          }
        });
      } catch (error) {
        console.error('Failed to initialize RTSP player:', error);
      }
    };

    initPlayer();

    // Cleanup function
    return () => {
      // Add any cleanup if needed
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="max-w-full h-auto border border-gray-300 rounded-lg"
      />
    </div>
  );
};

export default RTSPPlayer;