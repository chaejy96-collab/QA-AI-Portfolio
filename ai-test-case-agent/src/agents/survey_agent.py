from pathlib import Path


def run_survey(figma: dict, requirements: str, existing_tc: list[dict]) -> dict:
    components = []
    for page in figma.get("pages", []):
        for frame in page.get("frames", []):
            for component in frame.get("components", []):
                components.append({"id": component["id"], "label": component.get("label"), "type": component["type"]})

    criteria = [line[2:].strip() for line in requirements.splitlines() if line.startswith("- ")]
    return {
        "agent": "Survey",
        "workspace": "survey",
        "source_refs": ["fixtures/figma/profile-settings.json", "fixtures/requirements/profile-settings.md", "fixtures/existing-tc/profile-settings.json"],
        "feature": figma.get("file_name"),
        "roles": ["signed-in user"],
        "components": components,
        "requirements": criteria,
        "existing_tc_count": len(existing_tc),
        "observed_states": ["idle", "loading", "success", "error", "validation error"],
    }
