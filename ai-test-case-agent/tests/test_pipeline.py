import json
import tempfile
import unittest
from pathlib import Path

from src.agents.design_agent import freeze_criteria
from src.agents.validation_agent import validate_test_cases
from src.agents.write_agent import write_test_cases


ROOT = Path(__file__).resolve().parents[1]


class PipelineRulesTest(unittest.TestCase):
    def setUp(self):
        self.approval = json.loads((ROOT / "fixtures/approval/criteria-approved.json").read_text())
        survey = {"agent": "Survey"}
        audit = {"agent": "Audit", "findings": [], "coverage_gaps": ["keyboard behavior"]}
        self.frozen = freeze_criteria(survey, audit, self.approval)

    def test_write_uses_only_frozen_criteria_and_validation_passes(self):
        cases = write_test_cases(self.frozen)
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["error_count"], 0)
        self.assertEqual(len(cases), len(self.frozen["criteria"]))

    def test_missing_required_field_blocks_delivery(self):
        cases = write_test_cases(self.frozen)
        cases[0].pop("evidence_refs")
        result = validate_test_cases(cases, self.frozen)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertGreater(result["error_count"], 0)

    def test_unapproved_criteria_cannot_be_frozen(self):
        with self.assertRaises(RuntimeError):
            freeze_criteria({"agent": "Survey"}, {"agent": "Audit", "findings": []}, {"approved": False})


if __name__ == "__main__":
    unittest.main()
