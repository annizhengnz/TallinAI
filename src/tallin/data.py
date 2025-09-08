import json
from pathlib import Path
from typing import Dict, Tuple


def merge_dicts_prefer_second(first: Dict, second: Dict) -> Dict:
    """Shallow-merge two dicts; keys from `second` overwrite `first` on conflict."""
    merged = dict(first)
    merged.update(second)
    return merged


def write_combined_inventory_and_events(
    inv_a: Dict,
    ev_a: Dict,
    inv_b: Dict,
    ev_b: Dict,
    inventory_path: str,
    events_path: str,
) -> Tuple[Path, Path]:
    """
    Combine two inventory dicts and two events dicts and write them to JSON files.

    - On key collisions, entries from the second dict overwrite the first.
    - Files are written as flat JSON objects (dicts), not arrays.
    """
    inventory = merge_dicts_prefer_second(inv_a, inv_b)
    events = merge_dicts_prefer_second(ev_a, ev_b)

    inv_file = Path(inventory_path).resolve()
    ev_file = Path(events_path).resolve()

    inv_file.write_text(json.dumps(inventory, indent=2, ensure_ascii=False))
    ev_file.write_text(json.dumps(events, indent=2, ensure_ascii=False))

    return inv_file, ev_file


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


