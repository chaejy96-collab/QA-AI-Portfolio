import json
import subprocess
import sys
from pathlib import Path

from .audit_agent import run_audit
from .design_agent import freeze_criteria
from .senior_agent import review_as_senior
from .survey_agent import run_survey
from .validation_agent import validate_test_cases
from .write_agent import write_test_cases


def _load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_pipeline(project_root: Path, output_dir: Path) -> dict:
    figma = _load_json(project_root / "fixtures/figma/profile-settings.json")
    requirements_path = project_root / "fixtures/requirements/profile-settings.md"
    requirements = requirements_path.read_text(encoding="utf-8")
    existing_tc = _load_json(project_root / "fixtures/existing-tc/profile-settings.json")
    approval = _load_json(project_root / "fixtures/approval/criteria-approved.json")
    workspaces = output_dir / "workspaces"

    survey = run_survey(figma, requirements, existing_tc)
    audit = run_audit(figma, requirements, existing_tc)
    _write_json(workspaces / "survey/result.json", survey)
    _write_json(workspaces / "audit/result.json", audit)

    frozen = freeze_criteria(survey, audit, approval)
    _write_json(workspaces / "design/frozen-criteria.json", frozen)

    cases = write_test_cases(frozen)
    _write_json(workspaces / "write/test-cases.json", cases)
    _write_json(output_dir / "test-cases.json", cases)

    validation = validate_test_cases(cases, frozen)
    _write_json(workspaces / "validation/result.json", validation)
    if validation["error_count"]:
        return {"status": "BLOCKED", "validation": validation, "output_dir": str(output_dir)}

    senior = review_as_senior(cases, validation, audit)
    _write_json(workspaces / "senior/result.json", senior)
    if senior["status"] != "PASS":
        return {"status": "BLOCKED", "validation": validation, "senior": senior, "output_dir": str(output_dir)}

    xlsx_path = output_dir / "test-cases.xlsx"
    subprocess.run([
        sys.executable, str(project_root / "scripts/build_xlsx.py"),
        str(output_dir / "test-cases.json"), str(xlsx_path)
    ], cwd=project_root, check=True)
    final_validation = subprocess.run([
        sys.executable, str(project_root / "scripts/check_final_xlsx.py"), str(xlsx_path)
    ], cwd=project_root, capture_output=True, text=True)
    final_result = {"status": "PASS" if final_validation.returncode == 0 else "BLOCKED", "output": final_validation.stdout + final_validation.stderr}
    _write_json(output_dir / "final-validation.json", final_result)
    if final_validation.returncode:
        return {"status": "BLOCKED", "validation": validation, "senior": senior, "final_validation": final_result, "output_dir": str(output_dir)}
    return {"status": "PASS", "validation": validation, "senior": senior, "final_validation": final_result, "output_dir": str(output_dir)}
