## Inventory Domain Overview

This knowledge file provides a lightweight overview of how inventory is represented for the cereal aisle demo.

- Items have fields: id, name, sku, quantity, location
- Locations follow the format: "Aisle <number>, Shelf <number>"
- Quantities are integers representing on-hand units

Example item:

```json
{
  "id": "item-1",
  "name": "Alpen Cereal",
  "sku": "AL-CER-001",
  "quantity": 30,
  "location": "Aisle 5, Shelf 1"
}
```

Inventory changes happen when customers pick up or put back products, or when staff perform corrections or restocks.

