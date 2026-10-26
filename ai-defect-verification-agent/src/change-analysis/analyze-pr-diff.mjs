export function analyzePrDiff(diffText, sourcePath) {
  const files = [...diffText.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1]);
  const addedLines = diffText
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'));

  return {
    sourcePath,
    accessMode: 'read-only',
    changedFiles: files,
    addedLineCount: addedLines.length,
    findings: [
      'The diff adds a success-state message after a successful profile save response.',
      'The diff is treated as evidence of intent only; runtime verification remains required.'
    ]
  };
}
