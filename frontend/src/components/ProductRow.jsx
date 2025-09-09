import React from "react";

const ProductRow = ({ product, onStockChange }) => {
  // Determine status and corresponding CSS class based on stock level
  const getStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", className: "status-out" };
    if (stock <= 15) return { text: "Low Stock", className: "status-low" };
    return { text: "In Stock", className: "status-in" };
  };

  const status = getStatus(product.stock);

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.brand}</td>
      <td>${product.price.toFixed(2)}</td>
      <td className="stock-level">{product.stock}</td>
      <td>
        <span className={`status-badge ${status.className}`}>
          {status.text}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button onClick={() => onStockChange(product.id, 1)}>+</button>
          <button
            onClick={() => onStockChange(product.id, -1)}
            disabled={product.stock === 0}
          >
            -
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
