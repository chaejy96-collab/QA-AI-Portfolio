/**
 * Contract for an independent reviewer. A future Opus adapter may implement this
 * contract, but this demo deliberately uses only a synthetic fixture.
 */
export function validateIndependentReview(review) {
  if (!Array.isArray(review.blockingFindings) || typeof review.verdict !== 'string') {
    throw new Error('Independent review does not satisfy the expected contract.');
  }
  return review;
}
