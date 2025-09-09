// src/components/InventoryTable.jsx

import React, { useState } from "react";
import { initialProducts } from "../data";
import ProductRow from "./ProductRow";
import "./Inventory.css";

const InventoryTable = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  // Handler to update stock for a specific product
  const handleStockChange = (productId, amount) => {
    setProducts((currentProducts) =>
      currentProducts.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p,
      ),
    );
  };

  // Filter products based on search term (name or brand)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="inventory-container">
      <h1></h1>
      <input
        type="text"
        placeholder="Search by name or brand..."
        className="search-bar"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onStockChange={handleStockChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
