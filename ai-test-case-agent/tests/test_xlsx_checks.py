import json
import tempfile
import unittest
from pathlib import Path

from scripts.build_xlsx import build_xlsx
from scripts.check_final_xlsx import check as check_final_xlsx
from scripts.check_tc import check as check_tc

ROOT = Path(__file__).resolve().parents[1]


class XLSXChecksTest(unittest.TestCase):
    def setUp(self):
        self.sample_cases = [
            {
                "id": "TC-001",
                "title": "Sample Case",
                "priority": "P1",
                "preconditions": ["Precond"],
                "steps": ["Step 1"],
                "expected_result": "Expected",
                "evidence_refs": ["Ref-1"],
                "source_basis": ["Basis-1"],
                "needs_confirmation": False,
            }
        ]

    def test_check_tc_valid(self):
        with tempfile.NamedTemporaryFile("w+", suffix=".json", delete=False) as tf:
            tf.write(json.dumps(self.sample_cases))
            tf_path = Path(tf.name)
        try:
            errors = check_tc(tf_path)
            self.assertEqual(len(errors), 0)
        finally:
            tf_path.unlink(missing_ok=True)

    def test_check_tc_invalid_missing_field(self):
        invalid_cases = [dict(self.sample_cases[0])]
        invalid_cases[0].pop("title")
        with tempfile.NamedTemporaryFile("w+", suffix=".json", delete=False) as tf:
            tf.write(json.dumps(invalid_cases))
            tf_path = Path(tf.name)
        try:
            errors = check_tc(tf_path)
            self.assertGreater(len(errors), 0)
            self.assertTrue(any("missing title" in err for err in errors))
        finally:
            tf_path.unlink(missing_ok=True)

    def test_check_final_xlsx_valid(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "cases.json"
            xlsx_path = Path(tmpdir) / "cases.xlsx"
            json_path.write_text(json.dumps(self.sample_cases), encoding="utf-8")
            build_xlsx(json_path, xlsx_path)
            errors = check_final_xlsx(xlsx_path)
            self.assertEqual(len(errors), 0)

    def test_check_final_xlsx_nonexistent(self):
        errors = check_final_xlsx(Path("/nonexistent/file.xlsx"))
        self.assertGreater(len(errors), 0)


if __name__ == "__main__":
    unittest.main()
