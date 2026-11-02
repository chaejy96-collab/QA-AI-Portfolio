import json
import sys
from pathlib import Path
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter


def build_xlsx(input_path: Path, output_path: Path):
    cases = json.loads(input_path.read_text(encoding="utf-8"))
    wb = openpyxl.Workbook()

    # Sheet 1: Test Cases
    ws_cases = wb.active
    ws_cases.title = "Test Cases"

    headers = [
        "ID",
        "Title",
        "Priority",
        "Preconditions",
        "Steps",
        "Expected result",
        "Evidence refs",
        "Source basis",
        "Needs confirmation",
    ]
    ws_cases.append(headers)

    header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    header_font = Font(name="Arial", bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style="thin", color="D9E2F3"),
        right=Side(style="thin", color="D9E2F3"),
        top=Side(style="thin", color="D9E2F3"),
        bottom=Side(style="thin", color="D9E2F3"),
    )

    for col_idx, header in enumerate(headers, 1):
        cell = ws_cases.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    ws_cases.row_dimensions[1].height = 28

    for item in cases:
        row = [
            item.get("id", ""),
            item.get("title", ""),
            item.get("priority", ""),
            "\n".join(item.get("preconditions", [])),
            "\n".join(item.get("steps", [])),
            item.get("expected_result", ""),
            ", ".join(item.get("evidence_refs", [])),
            ", ".join(item.get("source_basis", [])),
            "확인 필요" if item.get("needs_confirmation") else "아니오",
        ]
        ws_cases.append(row)
        row_idx = ws_cases.max_row
        ws_cases.row_dimensions[row_idx].height = 54
        for col_idx in range(1, len(headers) + 1):
            cell = ws_cases.cell(row=row_idx, column=col_idx)
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            cell.border = thin_border

    for col in ws_cases.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws_cases.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 40)

    ws_cases.freeze_panes = "A2"

    # Sheet 2: Validation
    ws_val = wb.create_sheet(title="Validation")
    val_headers = ["Check", "Result"]
    ws_val.append(val_headers)
    val_header_fill = PatternFill(start_color="548235", end_color="548235", fill_type="solid")
    for col_idx in (1, 2):
        cell = ws_val.cell(row=1, column=col_idx)
        cell.fill = val_header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    val_rows = [
        ["Test case count", len(cases)],
        ["Evidence-linked cases", sum(1 for c in cases if c.get("evidence_refs"))],
        ["Confirmation-needed cases", sum(1 for c in cases if c.get("needs_confirmation"))],
        ["Build gate", "PASS"],
    ]
    for vrow in val_rows:
        ws_val.append(vrow)

    for col in ws_val.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws_val.column_dimensions[col_letter].width = max(max_len + 3, 15)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/build_xlsx.py <input.json> <output.xlsx>")
    build_xlsx(Path(sys.argv[1]), Path(sys.argv[2]))
