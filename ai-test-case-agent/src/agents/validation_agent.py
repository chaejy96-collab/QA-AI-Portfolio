REQUIRED_FIELDS = ["id", "title", "priority", "preconditions", "steps", "expected_result", "evidence_refs", "source_basis", "needs_confirmation"]


def validate_test_cases(cases: list[dict], frozen: dict) -> dict:
    errors = []
    warnings = []
    seen_ids = set()
    frozen_ids = {criterion["id"] for criterion in frozen.get("criteria", [])}
    covered_ids = set()

    for case in cases:
        missing = [field for field in REQUIRED_FIELDS if field not in case or case[field] in (None, "", [])]
        for field in missing:
            errors.append({"severity": "ERROR", "case_id": case.get("id", "UNKNOWN"), "message": f"Missing required field: {field}"})
        if case.get("id") in seen_ids:
            errors.append({"severity": "ERROR", "case_id": case.get("id"), "message": "Duplicate test case ID."})
        seen_ids.add(case.get("id"))
        covered_ids.update(case.get("source_basis", []))
        if case.get("needs_confirmation"):
            warnings.append({"severity": "WARN", "case_id": case.get("id"), "message": "Needs confirmation is explicitly carried into the test case."})

    for criterion_id in sorted(frozen_ids - covered_ids):
        errors.append({"severity": "ERROR", "case_id": "", "message": f"Frozen criterion is not covered: {criterion_id}"})

    return {
        "agent": "Validation",
        "status": "PASS" if not errors else "BLOCKED",
        "errors": errors,
        "warnings": warnings,
        "error_count": len(errors),
        "warning_count": len(warnings),
    }
