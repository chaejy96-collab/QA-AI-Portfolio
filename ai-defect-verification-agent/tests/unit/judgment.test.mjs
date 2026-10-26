import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzePrDiff } from '../../src/change-analysis/analyze-pr-diff.mjs';
import { reconcileWithIndependentReview } from '../../src/independent-review/reconcile.mjs';
import { Decision, makeInitialJudgment } from '../../src/judgment/decide.mjs';
import { assessCriteria } from '../../src/verification/load-criteria.mjs';

const criteria = [
  { id: 'C1', statement: 'success feedback' },
  { id: 'C2', statement: 'API success' },
  { id: 'C3', statement: 'required evidence' }
];
const completeObservation = {
  confirmationVisible: true,
  apiStatus: 200,
  evidenceTypes: ['screenshot', 'trace', 'video', 'observation']
};

test('sufficient direct evidence permits fix confirmation', () => {
  const judgment = makeInitialJudgment({
    execution: { status: 'passed' },
    criteriaResults: assessCriteria(criteria, completeObservation)
  });
  assert.equal(judgment.decision, Decision.FIX_CONFIRMED);
});

test('a still-observed defect is reproduced even when the run completed', () => {
  const judgment = makeInitialJudgment({
    execution: { status: 'passed' },
    criteriaResults: assessCriteria(criteria, completeObservation),
    defectObserved: true
  });
  assert.equal(judgment.decision, Decision.REPRODUCED);
});

test('a passed test without direct proof remains inconclusive', () => {
  const insufficient = { ...completeObservation, evidenceTypes: ['trace', 'video', 'observation'] };
  const judgment = makeInitialJudgment({
    execution: { status: 'passed' },
    criteriaResults: assessCriteria(criteria, insufficient)
  });
  assert.equal(judgment.decision, Decision.INCONCLUSIVE);
});

test('a failed test run is not treated as a product verdict', () => {
  const judgment = makeInitialJudgment({
    execution: { status: 'failed' },
    criteriaResults: assessCriteria(criteria, completeObservation)
  });
  assert.equal(judgment.decision, Decision.EXECUTION_FAILED);
});

test('blocking independent review prevents a false fix-confirmed result', () => {
  const finalJudgment = reconcileWithIndependentReview(
    { decision: Decision.FIX_CONFIRMED, rationale: 'initial evidence looked sufficient' },
    { blockingFindings: ['The required screenshot is unrelated to the stated expectation.'] }
  );
  assert.equal(finalJudgment.decision, Decision.INCONCLUSIVE);
  assert.equal(finalJudgment.overriddenByIndependentReview, true);
});

test('PR diff analysis is explicitly read-only', () => {
  const analysis = analyzePrDiff('+++ b/demo-app/app.js\n+status.textContent = \'Profile saved\';', 'fixture.diff');
  assert.equal(analysis.accessMode, 'read-only');
  assert.deepEqual(analysis.changedFiles, ['demo-app/app.js']);
});
