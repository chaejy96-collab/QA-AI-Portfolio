def write_test_cases(frozen: dict) -> list[dict]:
    if not frozen.get("approved"):
        raise RuntimeError("Write Agent requires approved frozen criteria.")

    cases = []
    for index, criterion in enumerate(frozen["criteria"], start=1):
        cases.append({
            "id": f"TC-PROFILE-{index:03d}",
            "title": criterion["statement"],
            "priority": "P1" if criterion["id"] in {"AC-02", "AC-03"} else "P2",
            "preconditions": ["User is signed in", "Profile edit screen is open"],
            "steps": [
                "Enter or leave the display name according to the criterion.",
                "Trigger the Save action or the relevant validation path.",
                "Observe the control state and user feedback."
            ],
            "expected_result": criterion["statement"],
            "evidence_refs": criterion["source_refs"],
            "source_basis": [criterion["id"]],
            "needs_confirmation": criterion["needs_confirmation"],
        })
    return cases
