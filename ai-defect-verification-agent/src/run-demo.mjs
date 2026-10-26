import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzePrDiff } from './change-analysis/analyze-pr-diff.mjs';
import { validateIndependentReview } from './independent-review/interface.mjs';
import { reconcileWithIndependentReview } from './independent-review/reconcile.mjs';
import { makeInitialJudgment } from './judgment/decide.mjs';
import { writeFinalReport } from './report/create-report.mjs';
import { assessCriteria, loadCriteria } from './verification/load-criteria.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactsRoot = resolve(root, 'artifacts');
const defaultScenario = {
  issuePath: 'fixtures/jira/QADEMO-101.json',
  diffPath: 'fixtures/pull-requests/QADEMO-101.diff',
  reviewPath: 'fixtures/reviews/QADEMO-101.synthetic-review.json',
  criteriaPath: '기준.md',
  testFile: 'tests/e2e/verify-fixed.spec.mjs',
  repeatCount: 2
};

function optionValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`);
  return value;
}

function projectPath(value, label) {
  if (typeof value !== 'string') throw new Error(`${label} must be a relative project path.`);
  const path = resolve(root, value);
  if (path !== root && !path.startsWith(`${root}/`)) {
    throw new Error(`${label} must remain inside the project directory.`);
  }
  return path;
}

function artifactPath(value) {
  const path = projectPath(value, 'Artifact directory');
  if (path !== artifactsRoot && !path.startsWith(`${artifactsRoot}/`)) {
    throw new Error('Artifact directory must remain under artifacts/.');
  }
  return path;
}

async function createPaths() {
  const scenarioOption = optionValue('--scenario');
  const scenario = scenarioOption
    ? { ...defaultScenario, ...JSON.parse(await readFile(projectPath(scenarioOption, 'Scenario'), 'utf8')) }
    : defaultScenario;
  const repeatCount = Number(scenario.repeatCount);
  if (!Number.isInteger(repeatCount) || repeatCount < 1) {
    throw new Error('repeatCount must be a positive integer.');
  }
  const artifacts = artifactPath(optionValue('--artifacts-dir') || 'artifacts');

  return {
    artifacts,
    issue: projectPath(scenario.issuePath, 'Issue fixture'),
    diff: projectPath(scenario.diffPath, 'PR diff fixture'),
    review: projectPath(scenario.reviewPath, 'Independent-review fixture'),
    criteria: projectPath(scenario.criteriaPath, 'Criteria file'),
    testFile: projectPath(scenario.testFile, 'Playwright test file'),
    repeatCount,
    report: resolve(artifacts, 'final-report.md')
  };
}

async function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

async function resetArtifacts(directory) {
  if (directory !== artifactsRoot) {
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
    return;
  }

  // The default demo shares artifacts/ with integration-test subdirectories.
  // Remove only its own generated files so separate scenario evidence survives.
  await Promise.all([
    'test-results',
    'playwright-results.json',
    'playwright-results.raw.json',
    'final-report.md',
    'final-report.json'
  ].map((name) => rm(resolve(directory, name), { recursive: true, force: true })));
  await mkdir(directory, { recursive: true });
}

function runPlaywright(paths) {
  const executable = process.platform === 'win32'
    ? resolve(root, 'node_modules/.bin/playwright.cmd')
    : resolve(root, 'node_modules/.bin/playwright');
  return new Promise((resolveRun) => {
    const testFile = relative(root, paths.testFile);
    const child = spawn(executable, ['test', testFile, `--repeat-each=${paths.repeatCount}`], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, DEMO_ARTIFACTS_DIR: relative(root, paths.artifacts) }
    });
    child.on('error', () => resolveRun({ status: 'failed', exitCode: null }));
    child.on('close', (exitCode) => resolveRun({ status: exitCode === 0 ? 'passed' : 'failed', exitCode }));
  });
}

function typeFromFile(path) {
  if (path.endsWith('.png')) return 'screenshot';
  if (path.endsWith('trace.zip')) return 'trace';
  if (path.endsWith('.webm')) return 'video';
  if (path.endsWith('verification-observation.json')) return 'observation';
  return null;
}

async function main() {
  const paths = await createPaths();
  await resetArtifacts(paths.artifacts);

  const [issue, diffText, criteriaText, review] = await Promise.all([
    readFile(paths.issue, 'utf8').then(JSON.parse),
    readFile(paths.diff, 'utf8'),
    readFile(paths.criteria, 'utf8'),
    readFile(paths.review, 'utf8').then(JSON.parse)
  ]);
  const criteria = loadCriteria(criteriaText);
  const changeAnalysis = analyzePrDiff(diffText, relative(root, paths.diff));

  const executionRun = await runPlaywright(paths);
  const resultFiles = await listFiles(resolve(paths.artifacts, 'test-results'));
  const observationPath = resultFiles.find((path) => path.endsWith('verification-observation.json'));
  const observation = observationPath
    ? JSON.parse(await readFile(observationPath, 'utf8'))
    : undefined;
  const evidenceTypes = [...new Set(resultFiles.map(typeFromFile).filter(Boolean))];
  const enrichedObservation = observation ? { ...observation, evidenceTypes } : undefined;
  const criteriaResults = assessCriteria(criteria, enrichedObservation);
  const execution = {
    ...executionRun,
    command: `playwright test ${relative(root, paths.testFile)} --repeat-each=${paths.repeatCount}`,
    repeatCount: paths.repeatCount
  };
  const initialJudgment = makeInitialJudgment({
    execution,
    criteriaResults,
    defectObserved: enrichedObservation?.defectObserved === true
  });
  const independentReview = validateIndependentReview(review);
  const finalJudgment = reconcileWithIndependentReview(initialJudgment, independentReview);
  const report = {
    issue,
    inputs: {
      issuePath: relative(root, paths.issue),
      diffPath: relative(root, paths.diff),
      criteriaPath: relative(root, paths.criteria)
    },
    changeAnalysis,
    execution,
    evidence: {
      files: resultFiles.map((path) => relative(root, path)),
      types: evidenceTypes,
      observation: enrichedObservation
    },
    criteriaResults,
    initialJudgment,
    independentReview,
    finalJudgment
  };
  await writeFinalReport(paths.report, report);

  if (existsSync(resolve(paths.artifacts, 'playwright-results.json'))) {
    await cp(resolve(paths.artifacts, 'playwright-results.json'), resolve(paths.artifacts, 'playwright-results.raw.json'));
  }
  console.log(`\nFinal decision: ${finalJudgment.decision}`);
  console.log(`Report: ${relative(root, paths.report)}`);
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
