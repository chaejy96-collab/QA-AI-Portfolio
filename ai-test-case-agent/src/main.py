import argparse
import shutil
from pathlib import Path

from agents.main_orchestrator import run_pipeline


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the synthetic Figma test-case agent pipeline.")
    parser.add_argument("--output", default="artifacts/demo", help="Output directory under the project root.")
    args = parser.parse_args()
    project_root = Path(__file__).resolve().parents[1]
    output_dir = (project_root / args.output).resolve()
    if project_root not in output_dir.parents and output_dir != project_root:
        raise SystemExit("Output must remain inside ai-test-case-agent.")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    result = run_pipeline(project_root, output_dir)
    print(f"Pipeline status: {result['status']}")
    print(f"Artifacts: {output_dir}")
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
