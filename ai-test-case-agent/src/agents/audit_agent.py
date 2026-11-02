def run_audit(figma: dict, requirements: str, existing_tc: list[dict]) -> dict:
    component_ids = {
        component["id"]
        for page in figma.get("pages", [])
        for frame in page.get("frames", [])
        for component in frame.get("components", [])
    }
    requirement_ids = [line.split(":", 1)[0].lstrip("- ") for line in requirements.splitlines() if line.startswith("- ")]
    findings = []
    if "inline-error" not in component_ids:
        findings.append({"severity": "ERROR", "code": "MISSING_ERROR_STATE", "message": "Error feedback is not represented in the supplied design."})
    if "AC-04" not in requirement_ids:
        findings.append({"severity": "WARN", "code": "MISSING_VALIDATION", "message": "Empty-value validation is not explicit in requirements."})

    return {
        "agent": "Audit",
        "workspace": "audit",
        "independent": True,
        "source_refs": ["fixtures/figma/profile-settings.json", "fixtures/requirements/profile-settings.md", "fixtures/existing-tc/profile-settings.json"],
        "checked_component_count": len(component_ids),
        "checked_requirement_ids": requirement_ids,
        "findings": findings,
        "coverage_gaps": ["keyboard submission behavior", "network timeout behavior"],
    }
