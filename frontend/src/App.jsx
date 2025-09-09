import React, { useState, useEffect, useCallback } from "react";
import MediaUpload from "./components/MediaUpload";
import InventoryTable from "./components/Table";
// --- ICONS ---
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const PackageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z"></path>
    <path d="M12 14.6a7.5 7.5 0 0 1-7.5-7.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5a7.5 7.5 0 0 1-7.5 7.5z"></path>
    <path d="M12 21.9V14.6"></path>
    <path d="M21.9 12H14.6"></path>
    <path d="M2.1 12h7.5"></path>
  </svg>
);
const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <line x1="8" x2="21" y1="6" y2="6"></line>
    <line x1="8" x2="21" y1="12" y2="12"></line>
    <line x1="8" x2="21" y1="18" y2="18"></line>
    <line x1="3" x2="3.01" y1="6" y2="6"></line>
    <line x1="3" x2="3.01" y1="12" y2="12"></line>
    <line x1="3" x2="3.01" y1="18" y2="18"></line>
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const Upload = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);
const ImageIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const VideoIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);
const X = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const Search = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// --- Main App Component ---
export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryPage />;
      case "events":
        return <EventsPage />;
      case "analyze":
        return (
          <div>
            <MediaUpload />
            <InventoryTable />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

// --- Layout Components ---

const Sidebar = ({ activeView, setActiveView, isOpen, setOpen }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { id: "inventory", label: "Inventory", icon: <PackageIcon /> },
    { id: "events", label: "Events", icon: <ListIcon /> },
    { id: "analyze", label: "Stocktaking", icon: <CameraIcon /> },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 bg-white w-64 p-4 border-r transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tallin</h1>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.id);
                }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const Header = ({ toggleSidebar }) => (
  <header className="flex items-center justify-between p-4 bg-white border-b">
    <button
      onClick={toggleSidebar}
      className="text-gray-600 hover:text-gray-800"
    >
      <MenuIcon />
    </button>
    <div className="text-xl font-semibold text-gray-800"></div>
    <div></div>
  </header>
);

// --- Page Components ---

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    eventsToday: 0,
  });

  useEffect(() => {
    // Mock data fetching
    setStats({ totalItems: 575, lowStock: 12, eventsToday: 2 });
  }, []);

  const statCards = [
    { label: "Total Inventory Items", value: stats.totalItems },
    { label: "Low Stock Alerts", value: stats.lowStock },
    { label: "Events Detected", value: stats.eventsToday },
    { label: "Agent Status", value: "Idle", special: true },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome to Tallin.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
            <p
              className={`text-3xl font-bold mt-2 ${card.special ? "text-green-500" : "text-gray-800"}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-600">Activity feed will be displayed here.</p>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        setInventory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch inventory data.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center p-8">Loading inventory...</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Inventory Management
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">SKU</th>
              <th className="p-4 font-semibold text-gray-600">Quantity</th>
              <th className="p-4 font-semibold text-gray-600">Location</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-gray-500">{item.sku}</td>
                <td className="p-4 font-medium">{item.quantity}</td>
                <td className="p-4 text-gray-500">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(
          data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        );
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch event data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading events...</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

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
                <td className="p-4 text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
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
};
