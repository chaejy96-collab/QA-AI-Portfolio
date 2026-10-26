import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeFinalReport(path, report) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path.replace(/\.md$/, '.json'), `${JSON.stringify(report, null, 2)}\n`);

  const criterionLines = report.criteriaResults
    .map((criterion) => `| ${criterion.id} | ${criterion.passed ? 'pass' : 'not proven'} | ${criterion.statement} |`)
    .join('\n');
  const evidenceLines = report.evidence.files.length > 0
    ? report.evidence.files.map((file) => `- \`${file}\``).join('\n')
    : '- No evidence files were collected.';
  const changedFiles = report.changeAnalysis.changedFiles.length > 0
    ? report.changeAnalysis.changedFiles.map((file) => `- \`${file}\``).join('\n')
    : '- No changed files identified.';
  const changeFindings = report.changeAnalysis.findings
    .map((finding) => `- ${finding}`).join('\n');

  const markdown = `# QA verification report — ${report.issue.key}

## Final decision

- **${report.finalJudgment.decision}**
- ${report.finalJudgment.rationale}
- Independent-review override: ${report.finalJudgment.overriddenByIndependentReview ? 'yes' : 'no'}

## Inputs

- Jira fixture: \`${report.inputs.issuePath}\` (synthetic)
- PR diff: \`${report.inputs.diffPath}\` (read-only analysis)
- Criteria: \`${report.inputs.criteriaPath}\` (portfolio-demo criteria)
- Target version: \`${report.issue.targetVersion}\`

## Execution

- Status: ${report.execution.status}
- Command: \`${report.execution.command}\`
- Repeat count: ${report.execution.repeatCount}

## Read-only change analysis

- Access mode: ${report.changeAnalysis.accessMode}
- Added lines in supplied diff: ${report.changeAnalysis.addedLineCount}
- Changed files:
${changedFiles}
- Findings:
${changeFindings}

## Applied criteria

| ID | Result | Criterion |
| --- | --- | --- |
${criterionLines}

## Evidence

${evidenceLines}

## Initial judgment

- **${report.initialJudgment.decision}** — ${report.initialJudgment.rationale}

## Independent review

- Source: \`${report.independentReview.source}\`
- Live Opus review: ${report.independentReview.isLiveOpusReview}
- Verdict: ${report.independentReview.verdict}
- Blocking findings: ${report.independentReview.blockingFindings.length}

> This report is a local synthetic portfolio artifact. It does not update Jira, close an issue, or call an external AI service.
`;

  await writeFile(path, markdown);
}
