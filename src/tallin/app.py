from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from flask_cors import CORS
import uuid
import os
import json
import base64
from datetime import datetime
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List,Dict, Tuple
from pathlib import Path
# Configuration
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Pydantic Model for Structured Output ---
# This defines the exact JSON structure for a single event.
class Event(BaseModel):
    customer_gender: str
    customer_age_range: str
    action: str
    product_name: str
    quantity: int

# --- Load Database ---
def load_inventory_and_events(
    inventory_path: str,
    events_path: str,
) -> Tuple[Dict, Dict]:
    """Load inventory and events JSON files into dicts."""
    inv_file = Path(inventory_path).resolve()
    ev_file = Path(events_path).resolve()

    inventory = json.loads(inv_file.read_text()) if inv_file.exists() else {}
    events = json.loads(ev_file.read_text()) if ev_file.exists() else {}
    return inventory, events

inventory, events = load_inventory_and_events(
    inventory_path="../../data/inventory.json",
    events_path="../../data/events.json",
)

ALLOWED_EXTENSIONS = set(['mp4',"jpg","jpeg","png"])
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uploads'))
FRAME_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../tests'))
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1000 * 1000  # 500 MB
app.config['CORS_HEADER'] = 'application/json'

def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

SUCCESS_Code = 200
def get_json_result(code=SUCCESS_Code, message='success', data=None):
    response = {"code": code, "message": message}
    return jsonify(response)

@app.route('/api/upload', methods=['POST', 'GET'])
def fileUpload():
    if request.method == 'POST':
        file = request.files.getlist('files')
        filename = ""
        print(request.files, "....")
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                f.save(os.path.join(UPLOAD_FOLDER, filename))
            else:
                return get_json_result(code=400, message='File type not allowed')
        return get_json_result(code=SUCCESS_Code, message=f'{filename} Upload to database!')
    if request.method == 'GET':
        return get_json_result(code=SUCCESS_Code, message='File type not allowed')


SUPPORT_MODELS = ["Restock","Stocktaking"]
def validate_query_params(query: str, model: str) -> tuple[bool, str]:
    """
    Validate the required query parameters.
    Returns (is_valid, error_message)
    """
    if not query:
        return False, "Query text is required"
    if not model:
        return False, "Model selection is required"
    supported_models = SUPPORT_MODELS
    if model not in supported_models:
        return False, f"Unsupported model. Please choose from: {', '.join(supported_models)}"

    return True, ""


from pipeline.preprocess import video_to_frames
from pipeline.mllm import analyze_image
from pipeline.mllm import gen_report

def analyze_videos(upload_path):
    video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.flv', '.webm']
    video_paths = []

    if not os.path.exists(upload_path):
        return "No video uploaded"
    for filename in os.listdir(upload_path):
        file_path = os.path.join(upload_path, filename)
        if os.path.isfile(file_path):
            _, ext = os.path.splitext(filename)
            if ext.lower() in video_extensions:
                video_paths.append(file_path)
    if len(video_paths) == 0:
        return "No video uploaded"
    output_dir = FRAME_FOLDER
    video_to_frames(video_paths[0], output_dir,fps=0.2)
    frame_results = []
    for image_path in Path(output_dir).glob("*.png"):
        result = analyze_image(image_path)
        frame_results.append(result)
    report = gen_report(frame_results)
    return report

@app.route('/api/query',methods= ["POST"])
def runQuery():
    user_query = request.args.get('query',  type=str)
    if not user_query:
        return get_json_result(code=400, message='Query text is required')
    if not request.args.get('model'):
        return get_json_result(code=400, message='Model selection is required')
    supported_models = SUPPORT_MODELS
    if request.args.get('model') not in supported_models:
        return get_json_result(code=400, message=f"Unsupported model. Please choose from: {', '.join(supported_models)}")
    report = analyze_videos(UPLOAD_FOLDER)
    return get_json_result(code=SUCCESS_Code, message= report)


# --- Gemini API Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# --- API Endpoints ---

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Retrieve all inventory items."""
    return jsonify(list(inventory.values()))

@app.route('/api/inventory/<item_id>', methods=['GET'])
def get_inventory_item(item_id):
    """Retrieve a single inventory item by its ID."""
    item = inventory.get(item_id)
    if item:
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404

@app.route('/api/inventory', methods=['POST'])
def add_inventory_item():
    """Add a new item to the inventory."""
    if not request.json or not 'name' in request.json or not 'quantity' in request.json:
        return jsonify({"error": "Missing required fields: name, quantity"}), 400

    new_id = f"item-{len(inventory) + 1}"
    new_item = {
        "id": new_id,
        "name": request.json['name'],
        "sku": request.json.get('sku', f"SKU-{new_id.upper()}"),
        "quantity": request.json['quantity'],
        "location": request.json.get('location', 'Unassigned')
    }
    inventory[new_id] = new_item
    return jsonify(new_item), 201

@app.route('/api/inventory/<item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    """Update an existing inventory item."""
    if item_id not in inventory:
        return jsonify({"error": "Item not found"}), 404
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400

    # Update item fields
    inventory[item_id]['name'] = request.json.get('name', inventory[item_id]['name'])
    inventory[item_id]['quantity'] = request.json.get('quantity', inventory[item_id]['quantity'])
    inventory[item_id]['location'] = request.json.get('location', inventory[item_id]['location'])
    inventory[item_id]['sku'] = request.json.get('sku', inventory[item_id]['sku'])

    return jsonify(inventory[item_id])

# == EVENT ENDPOINTS ==

@app.route('/api/events', methods=['GET'])
def get_events():
    """Retrieve all inventory change events."""
    return jsonify(list(events.values()))

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new inventory change event."""
    if not request.json or not 'type' in request.json or not 'description' in request.json:
        return jsonify({"error": "Missing required fields: type, description"}), 400

    new_id = str(uuid.uuid4())
    new_event = {
        "id": new_id,
        "type": request.json['type'],
        "timestamp": request.json.get('timestamp', '2025-09-08T16:00:00Z'),
        "description": request.json['description'],
        "itemId": request.json.get('itemId')
    }
    events[new_id] = new_event
    return jsonify(new_event), 201


if __name__ == '__main__':
    app.run(debug=True, port=5001)
