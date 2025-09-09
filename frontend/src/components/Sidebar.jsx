import React from "react";
import { HomeIcon, PackageIcon, ListIcon, CameraIcon } from "./Icons";

export default function Sidebar({ activeView, setActiveView, isOpen, setOpen }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { id: "inventory", label: "Inventory", icon: <PackageIcon /> },
    { id: "events", label: "Events", icon: <ListIcon /> },
    { id: "analyze", label: "Analyze Media", icon: <CameraIcon /> },
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
}


