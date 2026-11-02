def review_as_senior(cases: list[dict], validation: dict, audit: dict) -> dict:
    titles = [case.get("title", "") for case in cases]
    duplicates = sorted({title for title in titles if titles.count(title) > 1})
    findings = []
    if duplicates:
        findings.append({"severity": "ERROR", "message": f"Duplicate test titles: {duplicates}"})
    if validation.get("error_count"):
        findings.append({"severity": "ERROR", "message": "Validation errors block delivery."})
    findings.extend({"severity": "WARN", "message": gap} for gap in audit.get("coverage_gaps", []))
    return {
        "agent": "QA Senior",
        "status": "PASS" if not any(item["severity"] == "ERROR" for item in findings) else "BLOCKED",
        "findings": findings,
        "recommendation": "Build XLSX only after Validation and Senior status are PASS.",
    }
