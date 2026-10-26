import { Decision } from '../judgment/decide.mjs';

export function reconcileWithIndependentReview(initialJudgment, review) {
  if (initialJudgment.decision === Decision.FIX_CONFIRMED && review.blockingFindings.length > 0) {
    return {
      decision: Decision.INCONCLUSIVE,
      rationale: 'Independent review found blocking evidence gaps; the initial fix-confirmed decision is not retained.',
      overriddenByIndependentReview: true
    };
  }

  return {
    ...initialJudgment,
    overriddenByIndependentReview: false
  };
}
