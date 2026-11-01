#!/usr/bin/env python3
"""Small repository-local documentation checks for the foundation milestone."""

from pathlib import Path
import argparse
import re
import sys


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("--banned", type=Path, required=True)
    parser.add_argument("--check-links", action="store_true")
    args = parser.parse_args()

    banned = [line.strip().lower() for line in args.banned.read_text().splitlines() if line.strip()]
    findings: list[str] = []
    for path in sorted(args.root.rglob("*.md")):
        text = path.read_text()
        for word in banned:
            if re.search(rf"\b{re.escape(word)}\b", text, re.IGNORECASE):
                findings.append(f"{path}: contains banned word '{word}'")
        if re.search(r"\bFor AI agents\b", text, re.IGNORECASE):
            findings.append(f"{path}: contains an agent callout")
        if re.search(r"\bTODO\b|\bTBD\b", text):
            findings.append(f"{path}: contains an unfinished marker")
        for match in re.finditer(r"\]\(([^)#]+)(?:#[^)]+)?\)", text):
            target = match.group(1)
            if target.startswith(("http://", "https://", "/")):
                continue
            candidate = (path.parent / target).resolve()
            if args.check_links and not candidate.exists():
                findings.append(f"{path}: broken relative link '{target}'")

    for finding in findings:
        print(finding)
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())

