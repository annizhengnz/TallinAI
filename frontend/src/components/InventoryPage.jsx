import React, { useEffect, useState } from "react";

export default function InventoryPage() {
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
      .catch(() => {
        setError("Failed to fetch inventory data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading inventory...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management</h2>
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
}


