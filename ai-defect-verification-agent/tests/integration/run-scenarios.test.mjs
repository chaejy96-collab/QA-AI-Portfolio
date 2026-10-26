import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function runScenario(name) {
  const artifactDirectory = `artifacts/integration-tests/${name}`;
  const argumentsForRunner = [
    'src/run-demo.mjs',
    '--scenario', `fixtures/scenarios/${name}.json`,
    '--artifacts-dir', artifactDirectory
  ];

  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, argumentsForRunner, { cwd: root });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', async (exitCode) => {
      try {
        const reportPath = resolve(root, artifactDirectory, 'final-report.json');
        const report = JSON.parse(await readFile(reportPath, 'utf8'));
        resolveRun({ exitCode, report, stderr });
      } catch (error) {
        reject(error);
      }
    });
  });
}

test('reproduced scenario flows from synthetic input to final report', async () => {
  const { exitCode, report, stderr } = await runScenario('reproduced');
  assert.equal(exitCode, 0, stderr);
  assert.equal(report.issue.key, 'QADEMO-102');
  assert.equal(report.execution.status, 'passed');
  assert.equal(report.evidence.observation.defectObserved, true);
  assert.equal(report.initialJudgment.decision, '재현됨');
  assert.equal(report.finalJudgment.decision, '재현됨');
});

test('passed Playwright run with missing evidence remains inconclusive in the final report', async () => {
  const { exitCode, report, stderr } = await runScenario('insufficient-evidence');
  assert.equal(exitCode, 0, stderr);
  assert.equal(report.issue.key, 'QADEMO-103');
  assert.equal(report.execution.status, 'passed');
  assert.equal(report.criteriaResults.find((criterion) => criterion.id === 'C3').passed, false);
  assert.equal(report.initialJudgment.decision, '판단 보류');
  assert.equal(report.finalJudgment.decision, '판단 보류');
});

test('failed Playwright run produces an execution-failed final report', async () => {
  const { exitCode, report, stderr } = await runScenario('execution-failure');
  assert.equal(exitCode, 0, stderr);
  assert.equal(report.issue.key, 'QADEMO-104');
  assert.equal(report.execution.status, 'failed');
  assert.equal(report.initialJudgment.decision, '실행 실패');
  assert.equal(report.finalJudgment.decision, '실행 실패');
});
