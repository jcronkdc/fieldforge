"""Quick Open Graph inspector utility.

Usage:
    pip install PyOpenGraph
    python tools/opengraph/inspect.py https://mythatron.com/
"""

from __future__ import annotations

import argparse
import json
from typing import Any

try:
    from pyopengraph import OpenGraph  # type: ignore
except ModuleNotFoundError as exc:  # pragma: no cover - optional dependency
    raise SystemExit(
        "PyOpenGraph is not installed. Run `pip install PyOpenGraph` first."
    ) from exc


def normalize(data: Any) -> Any:
    if isinstance(data, dict):
        return {k: normalize(v) for k, v in sorted(data.items())}
    if isinstance(data, list):
        return [normalize(item) for item in data]
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect Open Graph metadata")
    parser.add_argument("url", help="Target URL to parse")
    args = parser.parse_args()

    graph = OpenGraph(url=args.url)
    payload = {
        "title": graph.get("title"),
        "type": graph.get("type"),
        "url": graph.get("url"),
        "description": graph.get("description"),
        "images": graph.get("image"),
        "raw": graph,
    }

    print(json.dumps(normalize(payload), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

