import React, { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch event data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading events...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Log</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Timestamp</th>
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-500">{new Date(event.timestamp).toLocaleString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                    {event.type}
                  </span>
                </td>
                <td className="p-4">{event.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


