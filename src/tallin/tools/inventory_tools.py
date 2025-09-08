from datetime import datetime
from typing import Optional, Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class InventoryToolInput(BaseModel):
    """Input schema for InventoryTools multi-command interface."""
    command: str = Field(..., description="One of: find_item_by_name, update_inventory, create_event_record")
    product_name: Optional[str] = Field(None, description="Product name to search for.")
    item_id: Optional[str] = Field(None, description="Inventory item id to update or log against.")
    quantity_change: Optional[int] = Field(None, description="Positive or negative quantity delta.")
    description: Optional[str] = Field(None, description="Description for event creation.")


class InventoryTools(BaseTool):
    """
    A custom tool for the Inventory Manager agent to interact with an in-memory database.
    This tool supports multiple commands via the `command` argument.
    """

    name: str = "Inventory Management Toolset"
    description: str = "A set of tools for interacting with the inventory database."
    args_schema: Type[BaseModel] = InventoryToolInput
    inventory: dict = Field(default_factory=dict)
    events: dict = Field(default_factory=dict)

    def _run(
        self,
        command: str,
        product_name: Optional[str] = None,
        item_id: Optional[str] = None,
        quantity_change: Optional[int] = None,
        description: Optional[str] = None,
    ) -> str:
        if command == "find_item_by_name":
            return self._find_item_by_name(product_name)
        if command == "update_inventory":
            return self._update_inventory(item_id, quantity_change)
        if command == "create_event_record":
            return self._create_event_record(description, item_id)
        return f"Unknown command: {command}"

    # Internal helpers
    def _find_item_by_name(self, product_name: Optional[str]) -> str:
        if not product_name:
            return "Error: product_name cannot be empty."
        for item_id, details in self.inventory.items():
            if product_name.lower() in details.get("name", "").lower():
                return f"Found item with ID: {item_id}"
        return f"Error: Product '{product_name}' not found."

    def _update_inventory(self, item_id: Optional[str], quantity_change: Optional[int]) -> str:
        if not item_id or item_id not in self.inventory:
            return f"Error: Item ID '{item_id}' not found."
        if quantity_change is None:
            return "Error: quantity_change must be provided."
        self.inventory[item_id]["quantity"] = self.inventory[item_id]["quantity"] + int(quantity_change)
        return f"Successfully updated item {item_id}. New quantity: {self.inventory[item_id]['quantity']}"

    def _create_event_record(self, description: Optional[str], item_id: Optional[str]) -> str:
        if not item_id:
            return "Error: item_id must be provided."
        if not description:
            description = "Inventory change recorded by AI."
        new_id = f"evt-{len(self.events) + 1}"
        new_event = {
            "id": new_id,
            "type": "AI Detection: Item Update",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "description": description,
            "itemId": item_id,
        }
        self.events[new_id] = new_event
        return f"Successfully created event record {new_id} for item {item_id}."


