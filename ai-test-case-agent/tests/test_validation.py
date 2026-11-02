import json
import unittest
from pathlib import Path

from src.agents.design_agent import freeze_criteria
from src.agents.validation_agent import validate_test_cases
from src.agents.write_agent import write_test_cases

ROOT = Path(__file__).resolve().parents[1]


class ValidationAgentTest(unittest.TestCase):
    def setUp(self):
        self.approval = json.loads((ROOT / "fixtures/approval/criteria-approved.json").read_text())
        survey = {"agent": "Survey"}
        audit = {"agent": "Audit", "findings": [], "coverage_gaps": ["keyboard behavior"]}
        self.frozen = freeze_criteria(survey, audit, self.approval)

    def test_valid_cases_pass_validation(self):
        cases = write_test_cases(self.frozen)
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["status"], "PASS")
        self.assertEqual(result["error_count"], 0)

    def test_missing_field_causes_error(self):
        cases = write_test_cases(self.frozen)
        cases[0].pop("steps")
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertTrue(any("Missing required field: steps" in err["message"] for err in result["errors"]))

    def test_duplicate_id_causes_error(self):
        cases = write_test_cases(self.frozen)
        cases[1]["id"] = cases[0]["id"]
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertTrue(any("Duplicate test case ID" in err["message"] for err in result["errors"]))

    def test_uncovered_frozen_criterion_causes_error(self):
        cases = write_test_cases(self.frozen)
        cases = [c for c in cases if "AC-01" not in c["source_basis"]]
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertTrue(any("Frozen criterion is not covered: AC-01" in err["message"] for err in result["errors"]))


if __name__ == "__main__":
    unittest.main()
