export function loadCriteria(markdown) {
  const criteria = [...markdown.matchAll(/^- (C\d+): (.+)$/gm)].map((match) => ({
    id: match[1],
    statement: match[2]
  }));

  if (criteria.length === 0) {
    throw new Error('No verification criteria were found in 기준.md.');
  }

  return criteria;
}

export function assessCriteria(criteria, observation) {
  const checks = {
    C1: observation?.confirmationVisible === true,
    C2: observation?.apiStatus === 200,
    C3: observation?.evidenceTypes?.includes('screenshot') &&
      observation?.evidenceTypes?.includes('trace') &&
      observation?.evidenceTypes?.includes('video') &&
      observation?.evidenceTypes?.includes('observation')
  };

  return criteria.map((criterion) => ({
    ...criterion,
    passed: checks[criterion.id] ?? false
  }));
}
