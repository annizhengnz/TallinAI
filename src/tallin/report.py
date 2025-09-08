import json
import os
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any


def _load_events(events_path: Path) -> List[Dict[str, Any]]:
    if not events_path.exists():
        raise FileNotFoundError(f"Events file not found: {events_path}")
    data = json.loads(events_path.read_text())
    if isinstance(data, dict) and "events" in data:
        return list(data["events"])  # matches sample_events.json structure
    if isinstance(data, list):
        return data
    raise ValueError("Unsupported events.json format. Expected list or { 'events': [...] }.")


def _format_markdown_report(events: List[Dict[str, Any]]) -> str:
    timestamp = datetime.utcnow().isoformat() + "Z"
    lines: List[str] = []
    lines.append(f"## Inventory Events Report")
    lines.append("")
    lines.append(f"Generated: {timestamp}")
    lines.append("")

    if not events:
        lines.append("No events were detected.")
        return "\n".join(lines)

    # Detail table
    lines.append("### Detected Events")
    lines.append("")
    lines.append("| # | Gender | Age Range | Action | Product | Quantity |")
    lines.append("|---:|:------:|:---------:|:------:|:--------|--------:|")
    for idx, e in enumerate(events, start=1):
        lines.append(
            f"| {idx} | {e.get('customer_gender','')} | {e.get('customer_age_range','')} | {e.get('action','')} | {e.get('product_name','')} | {e.get('quantity',0)} |"
        )
    lines.append("")

    # Summary by product and action
    by_product: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for e in events:
        product = str(e.get("product_name", "")).strip() or "(unknown)"
        action = str(e.get("action", "")).strip().lower() or "unknown"
        qty = int(e.get("quantity", 0) or 0)
        by_product[product][action] += qty

    lines.append("### Summary by Product")
    lines.append("")
    lines.append("| Product | Picked Up | Put Back | Net Change |")
    lines.append("|:--------|----------:|---------:|-----------:|")
    for product, actions in sorted(by_product.items()):
        picked = actions.get("picked up", 0)
        put_back = actions.get("put back", 0)
        net = put_back - picked  # positive means increase in shelf quantity
        lines.append(f"| {product} | {picked} | {put_back} | {net} |")
    lines.append("")

    # High-level metrics
    total_picked = sum(a.get("picked up", 0) for a in by_product.values())
    total_put_back = sum(a.get("put back", 0) for a in by_product.values())
    lines.append("### Key Metrics")
    lines.append("")
    lines.append(f"- Total events: {len(events)}")
    lines.append(f"- Total units picked up: {total_picked}")
    lines.append(f"- Total units put back: {total_put_back}")
    lines.append(f"- Net shelf change (units): {total_put_back - total_picked}")

    return "\n".join(lines)


def generate_demo_report(events_file: str = "events.json", output_file: str = "report.md") -> Path:
    """
    Generate a concise markdown report from a crew output events file.

    Args:
        events_file: Path to the JSON file produced by the analysis task.
        output_file: Path to write the markdown report.

    Returns:
        Path to the generated report.
    """
    events_path = Path(events_file).resolve()
    report_path = Path(output_file).resolve()

    events = _load_events(events_path)
    markdown = _format_markdown_report(events)
    report_path.write_text(markdown)
    return report_path


def main() -> None:
    events_file = os.getenv("TALLIN_EVENTS_FILE", "events.json")
    output_file = os.getenv("TALLIN_REPORT_FILE", "report.md")
    path = generate_demo_report(events_file, output_file)
    print(str(path))


if __name__ == "__main__":
    main()


