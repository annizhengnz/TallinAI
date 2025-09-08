import json
import os
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

from tallin.crew import Tallin
from tallin.report import generate_demo_report


def _ensure_project_root() -> None:
    current = Path(__file__).resolve()
    for parent in [current] + list(current.parents):
        if (parent / 'pyproject.toml').exists():
            os.chdir(parent)
            return


app = Flask(__name__)
CORS(app)


@app.post('/run')
def run_crew():
    _ensure_project_root()
    try:
        body = request.get_json(force=True, silent=False) or {}
    except Exception:
        return jsonify({"detail": "Invalid JSON"}), 400

    image_path = (body.get('image_path') or '').strip()
    generate_report = bool(body.get('generate_report', True))

    if not image_path or not Path(image_path).expanduser().exists():
        return jsonify({"detail": "image_path does not exist"}), 400

    inputs = {
        'image_path': str(Path(image_path).expanduser()),
    }

    try:
        result = Tallin().crew().kickoff(inputs=inputs)
    except Exception as e:
        return jsonify({"detail": f"Crew run failed: {e}"}), 500

    # Try to read events.json if produced
    events_obj = None
    events_path = Path('events.json')
    if events_path.exists():
        try:
            events_obj = json.loads(events_path.read_text())
        except Exception:
            events_obj = None

    response = {
        "result": str(result),
        "events": events_obj,
    }

    if generate_report:
        try:
            out_path = generate_demo_report(str(events_path), 'report.md')
            response["report_path"] = str(out_path)
            response["report_markdown"] = out_path.read_text()
        except Exception:
            response["report_path"] = None
            response["report_markdown"] = None

    return jsonify(response)


def main() -> None:
    _ensure_project_root()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    app.run(host=host, port=port)


if __name__ == "__main__":
    main()


