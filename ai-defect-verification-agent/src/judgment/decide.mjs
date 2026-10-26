export const Decision = Object.freeze({
  FIX_CONFIRMED: '수정 확인',
  REPRODUCED: '재현됨',
  INCONCLUSIVE: '판단 보류',
  EXECUTION_FAILED: '실행 실패'
});

export function makeInitialJudgment({ execution, criteriaResults, defectObserved = false }) {
  if (execution.status !== 'passed') {
    return {
      decision: Decision.EXECUTION_FAILED,
      rationale: 'The verification run did not complete successfully; product correctness cannot be concluded.'
    };
  }

  if (defectObserved) {
    return {
      decision: Decision.REPRODUCED,
      rationale: 'The reported defect was observed in the verification environment.'
    };
  }

  const failedCriteria = criteriaResults.filter((criterion) => !criterion.passed);
  if (failedCriteria.length > 0) {
    return {
      decision: Decision.INCONCLUSIVE,
      rationale: `Required verification criteria are not proven: ${failedCriteria.map((criterion) => criterion.id).join(', ')}.`
    };
  }

  return {
    decision: Decision.FIX_CONFIRMED,
    rationale: 'All required criteria are directly supported by execution observations and required evidence.'
  };
}
