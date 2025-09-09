from google import genai
from google.genai import types
import os
# --- Gemini API Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_KEY = "AIzaSyBXvtbTvADKMMCYgzK_ZEFCaGXoTIH3MUM"
# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client(api_key = GEMINI_API_KEY)
# --- Prompt Design for Vison Task ---
prompt = """
Analyze the provided image from a retail store shelf camera.
Identify the primary customer interaction with a product.
Describe the customer and the action taken.
Your response MUST be a single, valid JSON object with the following structure:
{
  "customer_gender": "male | female | unknown",
  "customer_age_range": "child | teenager | young adult | adult | senior",
  "action": "picked up | put back | examined",
  "product_name": "string",
  "quantity": "integer"
}
Example: A woman takes two boxes of cereal.
{
  "customer_gender": "female",
  "customer_age_range": "adult",
  "action": "picked up",
  "product_name": "cereal",
  "quantity": 2
}
If no clear interaction is visible, return a JSON object with null values.
"""

def analyze_image(image_path):
    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        types.Part.from_bytes(
        data=image_bytes,
        mime_type='image/png',
        ),
        prompt
    ]
    )
    return response.text

import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Event:
    """Data class to validate and structure event data"""
    customer_gender: Optional[str]
    customer_age_range: Optional[str]
    action: Optional[str]
    product_name: Optional[str]
    quantity: Optional[int]

class ShoppingEventAnalyzer:
    def __init__(self):
        # Sample inventory - you can replace this with your actual inventory
        self.inventory = {
            "item_001": {"name": "Grape Nuts", "quantity": 50, "price": 4.99},
            "item_002": {"name": "Fibre 1", "quantity": 30, "price": 3.49},
            "item_003": {"name": "Cheerios", "quantity": 25, "price": 4.29},
            "item_004": {"name": "Oat Bran", "quantity": 20, "price": 3.99}
        }

        # Event storage
        self.events = {}

    def parse_json_strings(self, data_list: List[str]) -> List[Dict[str, Any]]:
        """
        Parse JSON strings from the input list, handling the markdown formatting
        """
        parsed_events = []

        for item in data_list:
            try:
                # Remove markdown code block formatting if present
                if item.startswith('```json\n'):
                    json_content = item.replace('```json\n', '').replace('\n```', '').strip()
                else:
                    json_content = item

                # Parse JSON
                event_data = json.loads(json_content)
                parsed_events.append(event_data)

            except json.JSONDecodeError as e:
                print(f"Warning: Could not parse JSON from item: {item[:50]}... Error: {e}")
                continue

        return parsed_events

    def find_inventory_item(self, product_name: str) -> Optional[str]:
        """
        Find inventory item by partial name match (case-insensitive)
        """
        if not product_name:
            return None

        for item_id, item_details in self.inventory.items():
            if product_name.lower() in item_details['name'].lower():
                return item_id
        return None

    def process_events(self, analysis_data_list: List[str]) -> Dict[str, Any]:
        """
        Main processing function that analyzes the event data list
        """
        # Parse JSON strings
        parsed_events = self.parse_json_strings(analysis_data_list)

        # Process each event
        processed_events = []
        updated_items = []
        processing_log = []

        for event_data in parsed_events:
            try:
                # Validate event data
                analysis_event = Event(**event_data)

                action = analysis_event.action
                product_name_from_ai = analysis_event.product_name
                quantity_changed = analysis_event.quantity or 0

                # Process 'picked up' actions that affect inventory
                if (action == 'picked up' and
                    product_name_from_ai and
                    quantity_changed > 0):

                    # Find the inventory item
                    target_item_id = self.find_inventory_item(product_name_from_ai)

                    if target_item_id:
                        # Update inventory
                        old_quantity = self.inventory[target_item_id]['quantity']
                        self.inventory[target_item_id]['quantity'] -= quantity_changed

                        # Create event record
                        new_id = str(uuid.uuid4())
                        description = (
                            f"AI detected a {analysis_event.customer_age_range} "
                            f"{analysis_event.customer_gender} "
                            f"took {quantity_changed} unit(s) of "
                            f"'{self.inventory[target_item_id]['name']}'."
                        )

                        new_event = {
                            "id": new_id,
                            "type": "AI Detection: Item Removed",
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "description": description,
                            "itemId": target_item_id
                        }

                        self.events[new_id] = new_event
                        processed_events.append(new_event)
                        updated_items.append({
                            "item_id": target_item_id,
                            "name": self.inventory[target_item_id]['name'],
                            "old_quantity": old_quantity,
                            "new_quantity": self.inventory[target_item_id]['quantity'],
                            "quantity_changed": quantity_changed
                        })

                        processing_log.append(
                            f"Success: Processed event for '{self.inventory[target_item_id]['name']}' "
                            f"(quantity: {old_quantity} → {self.inventory[target_item_id]['quantity']})"
                        )
                    else:
                        processing_log.append(
                            f"Skipped: AI detected an event for product '{product_name_from_ai}', "
                            f"but it was not found in inventory."
                        )

                elif action == 'examined':
                    processing_log.append(
                        f"Info: Customer examined '{product_name_from_ai}' but didn't take it."
                    )

                elif not action or not product_name_from_ai:
                    processing_log.append("Skipped: Event contains null/empty data.")

                else:
                    processing_log.append(
                        f"Skipped: AI detected an event with action '{action}' "
                        f"which does not affect inventory."
                    )

            except Exception as e:
                processing_log.append(f"Error processing event: {e}")

        return {
            "message": "Analysis complete.",
            "processed_events": processed_events,
            "updated_items": updated_items,
            "processing_log": processing_log,
            "total_events_processed": len(parsed_events),
            "inventory_changes": len(updated_items)
        }

    def get_inventory_summary(self) -> Dict[str, Any]:
        """Get current inventory status"""
        return {
            "current_inventory": self.inventory,
            "total_items": len(self.inventory),
            "total_stock": sum(item['quantity'] for item in self.inventory.values())
        }

    def analyze_customer_patterns(self, analysis_data_list: List[str]) -> Dict[str, Any]:
        """Analyze customer behavior patterns from the data"""
        parsed_events = self.parse_json_strings(analysis_data_list)

        patterns = {
            "gender_distribution": {},
            "age_distribution": {},
            "action_distribution": {},
            "product_popularity": {}
        }

        for event_data in parsed_events:
            # Skip null/empty events
            if not any(event_data.values()):
                continue

            gender = event_data.get('customer_gender')
            age = event_data.get('customer_age_range')
            action = event_data.get('action')
            product = event_data.get('product_name')

            # Count distributions
            if gender:
                patterns["gender_distribution"][gender] = patterns["gender_distribution"].get(gender, 0) + 1
            if age:
                patterns["age_distribution"][age] = patterns["age_distribution"].get(age, 0) + 1
            if action:
                patterns["action_distribution"][action] = patterns["action_distribution"].get(action, 0) + 1
            if product:
                patterns["product_popularity"][product] = patterns["product_popularity"].get(product, 0) + 1

        return patterns
    def generate_full_report(self, analysis_data_list: List[str]) -> str:
            """
            Generate a comprehensive report combining all analysis information
            """
            report_lines = []

            # Get initial inventory
            initial_inventory = self.get_inventory_summary()

            report_lines.append("=== SHOPPING EVENT ANALYSIS REPORT ===\n")

            # Initial inventory
            report_lines.append("=== INITIAL INVENTORY ===")
            for item_id, details in initial_inventory["current_inventory"].items():
                report_lines.append(f"{item_id}: {details['name']} - Quantity: {details['quantity']}")

            # Process events
            report_lines.append("\n=== PROCESSING EVENTS ===")
            results = self.process_events(analysis_data_list)

            report_lines.append(f"Message: {results['message']}")
            report_lines.append(f"Total events processed: {results['total_events_processed']}")
            report_lines.append(f"Inventory changes: {results['inventory_changes']}")

            # Processing log
            report_lines.append("\n=== PROCESSING LOG ===")
            for log_entry in results['processing_log']:
                report_lines.append(f"- {log_entry}")

            # Processed events
            report_lines.append("\n=== PROCESSED EVENTS ===")
            if results['processed_events']:
                for event in results['processed_events']:
                    report_lines.append(f"Event ID: {event['id']}")
                    report_lines.append(f"Type: {event['type']}")
                    report_lines.append(f"Description: {event['description']}")
                    report_lines.append(f"Timestamp: {event['timestamp']}")
                    report_lines.append("---")
            else:
                report_lines.append("No events processed that affected inventory.")

            # Updated items
            report_lines.append("\n=== UPDATED ITEMS ===")
            if results['updated_items']:
                for item in results['updated_items']:
                    report_lines.append(f"Item: {item['name']}")
                    report_lines.append(f"Quantity changed: {item['old_quantity']} → {item['new_quantity']} (-{item['quantity_changed']})")
                    report_lines.append("---")
            else:
                report_lines.append("No inventory items were updated.")

            # Customer patterns
            report_lines.append("\n=== CUSTOMER PATTERNS ===")
            patterns = self.analyze_customer_patterns(analysis_data_list)
            for category, distribution in patterns.items():
                if distribution:
                    report_lines.append(f"{category.replace('_', ' ').title()}: {distribution}")

            # Final inventory
            report_lines.append("\n=== FINAL INVENTORY ===")
            final_inventory = self.get_inventory_summary()
            for item_id, details in final_inventory["current_inventory"].items():
                report_lines.append(f"{item_id}: {details['name']} - Quantity: {details['quantity']}")

            # Summary statistics
            report_lines.append("\n=== SUMMARY STATISTICS ===")
            report_lines.append(f"Total inventory items: {final_inventory['total_items']}")
            report_lines.append(f"Total remaining stock: {final_inventory['total_stock']}")
            report_lines.append(f"Events that changed inventory: {len(results['updated_items'])}")
            report_lines.append(f"Total events analyzed: {results['total_events_processed']}")

            return "\n".join(report_lines)
# Gen report without agent, rule based method
def gen_report(sample_data):
    # Create analyzer instance
    analyzer = ShoppingEventAnalyzer()

    # Generate and return complete report
    full_report = analyzer.generate_full_report(sample_data)
    return full_report
