def freeze_criteria(survey: dict, audit: dict, approval: dict) -> dict:
    if not approval.get("approved"):
        raise RuntimeError("Human approval gate is not satisfied; criteria cannot be frozen.")
    blocking = [finding for finding in audit.get("findings", []) if finding.get("severity") == "ERROR"]
    if blocking:
        raise RuntimeError("Audit contains blocking findings; criteria cannot be frozen.")

    criteria = [
        {"id": "AC-01", "statement": "Save is disabled while the save request is loading.", "source_refs": ["AC-01", "button-save"], "needs_confirmation": False},
        {"id": "AC-02", "statement": "A successful save displays Profile saved.", "source_refs": ["AC-02", "toast-success"], "needs_confirmation": False},
        {"id": "AC-03", "statement": "A failed save displays Unable to save profile and preserves the entered value.", "source_refs": ["AC-03", "inline-error"], "needs_confirmation": False},
        {"id": "AC-04", "statement": "An empty display name is rejected before submission.", "source_refs": ["AC-04", "input-display-name"], "needs_confirmation": False},
        {"id": "AUDIT-GAP-01", "statement": "Confirm keyboard submission and network timeout behavior before release.", "source_refs": audit.get("coverage_gaps", []), "needs_confirmation": True},
    ]
    return {
        "stage": "frozen_criteria",
        "approved": True,
        "source_agents": [survey["agent"], audit["agent"]],
        "criteria": criteria,
        "approval": approval,
    }
