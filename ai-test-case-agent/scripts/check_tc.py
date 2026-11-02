import json
import sys
from pathlib import Path

REQUIRED_FIELDS = ["id", "title", "priority", "preconditions", "steps", "expected_result", "evidence_refs", "source_basis", "needs_confirmation"]


def check(path: Path) -> list[str]:
    cases = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    ids = set()
    for case in cases:
        for field in REQUIRED_FIELDS:
            if field not in case or case[field] in (None, "", []):
                errors.append(f"ERROR {case.get('id', 'UNKNOWN')}: missing {field}")
        if case.get("id") in ids:
            errors.append(f"ERROR {case.get('id')}: duplicate id")
        ids.add(case.get("id"))
        if case.get("needs_confirmation") and not case.get("source_basis"):
            errors.append(f"ERROR {case.get('id')}: confirmation item has no basis")
    return errors


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/check_tc.py <test-cases.json>")
    errors = check(Path(sys.argv[1]))
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("ERROR 0")
    print(f"TC check PASS: {len(json.loads(Path(sys.argv[1]).read_text(encoding='utf-8')))} cases")
