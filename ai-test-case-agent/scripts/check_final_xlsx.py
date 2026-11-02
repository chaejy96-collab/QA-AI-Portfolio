import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}


def check(path: Path) -> list[str]:
    errors = []
    if not path.exists() or path.stat().st_size == 0:
        return ["ERROR: XLSX file is missing or empty"]
    try:
        with ZipFile(path) as archive:
            names = set(archive.namelist())
            for required in ("[Content_Types].xml", "xl/workbook.xml"):
                if required not in names:
                    errors.append(f"ERROR: missing {required}")
            workbook = ET.fromstring(archive.read("xl/workbook.xml"))
            sheet_names = [node.attrib.get("name") for node in workbook.findall("main:sheets/main:sheet", NS)]
            for required_sheet in ("Test Cases", "Validation"):
                if required_sheet not in sheet_names:
                    errors.append(f"ERROR: missing sheet {required_sheet}")
            for entry in names:
                if entry.startswith("xl/worksheets/") and entry.endswith(".xml"):
                    text = archive.read(entry).decode("utf-8", errors="replace")
                    if any(error in text for error in ("#REF!", "#DIV/0!", "#VALUE!")):
                        errors.append(f"ERROR: formula error marker in {entry}")
    except Exception as exc:
        errors.append(f"ERROR: unable to inspect XLSX: {exc}")
    return errors


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/check_final_xlsx.py <test-cases.xlsx>")
    errors = check(Path(sys.argv[1]))
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("Final XLSX check PASS")
