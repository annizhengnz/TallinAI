## Operational Guidelines for Inventory Updates

Use these rules when interpreting AI-detected events:

1. When action is "picked up": decrease quantity by the number of units.
2. When action is "put back": increase quantity by the number of units.
3. If a product name cannot be matched, log an error and do not update inventory.
4. Always create an event record with a descriptive message after any inventory change.
5. If resulting quantity would be negative, cap at zero and flag in the event description.

Event description template:

"{action} {quantity} unit(s) of {product_name}. Resulting quantity: {new_qty}."

