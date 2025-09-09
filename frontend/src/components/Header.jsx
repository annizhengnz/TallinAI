import React from "react";
import { MenuIcon } from "./Icons";

export default function Header({ toggleSidebar }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800">
        <MenuIcon />
      </button>
      <div className="text-xl font-semibold text-gray-800">Inventory Intelligence</div>
      <div></div>
    </header>
  );
}


