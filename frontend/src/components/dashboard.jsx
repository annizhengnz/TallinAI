import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    eventsToday: 0,
  });

  useEffect(() => {
    setStats({ totalItems: 575, lowStock: 12, eventsToday: 42 });
  }, []);

  const statCards = [
    { label: "Total Inventory Items", value: stats.totalItems },
    { label: "Low Stock Alerts", value: stats.lowStock },
    { label: "Events Detected Today", value: stats.eventsToday },
    { label: "System Status", value: "Operational", special: true },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Tallin.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
            <p className={`text-3xl font-bold mt-2 ${card.special ? "text-green-500" : "text-gray-800"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <p className="text-gray-600">Activity feed will be displayed here.</p>
      </div>
    </div>
  );
}

// src/components/InventoryDashboard.jsx

import React, { useState, useEffect } from "react";
import { initialProducts } from "../data";
import InventoryTable from "./Table";
import OOSAnalysis from "./OOS";
import "./Inventory.css";

const InventoryDashboard = () => {
  const [products, setProducts] = useState(initialProducts);
  const [oosEvents, setOosEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Real-time sales simulator
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setProducts((currentProducts) => {
        // Pick a random product to "sell"
        const productIndex = Math.floor(Math.random() * currentProducts.length);
        const productToSell = currentProducts[productIndex];

        if (productToSell && productToSell.stock > 0) {
          const newProducts = [...currentProducts];
          const updatedProduct = {
            ...productToSell,
            stock: productToSell.stock - 1,
          };
          newProducts[productIndex] = updatedProduct;

          // Check if the product just went out of stock
          if (updatedProduct.stock === 0) {
            logOosEvent(updatedProduct);
          }
          return newProducts;
        }
        return currentProducts; // No change if product is out of stock
      });
    }, 2500); // A "sale" happens every 2.5 seconds

    return () => clearInterval(simulationInterval); // Cleanup on unmount
  }, []);

  // Function to log an Out-of-Shelf event
  const logOosEvent = (product) => {
    // Avoid duplicate logs for the same stockout event
    if (
      !oosEvents.some(
        (event) => event.productId === product.id && event.resolved === false,
      )
    ) {
      const newEvent = {
        id: `oos-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        timestamp: new Date(),
        resolved: false, // In a real app, this would be true when restocked
      };
      setOosEvents((prevEvents) => [newEvent, ...prevEvents]);
    }
  };

  // Handler for manual stock changes (e.g., restocking)
  const handleStockChange = (productId, amount) => {
    setProducts((currentProducts) =>
      currentProducts.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p,
      ),
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentlyOosCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="inventory-container">
      <h1>Cereal Inventory Dashboard 🥣</h1>

      {/* OOS Analysis Component */}
      <OOSAnalysis
        oosEvents={oosEvents}
        currentlyOosCount={currentlyOosCount}
      />

      <div className="table-container">
        <h2>Shelf Inventory</h2>
        <input
          type="text"
          placeholder="Filter products..."
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Inventory Table Component */}
        <InventoryTable
          products={filteredProducts}
          onStockChange={handleStockChange}
        />
      </div>
    </div>
  );
};

export default InventoryDashboard;
