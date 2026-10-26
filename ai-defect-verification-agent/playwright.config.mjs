import { defineConfig } from '@playwright/test';

const artifactDirectory = process.env.DEMO_ARTIFACTS_DIR || './artifacts';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  // Repeat attempts are deliberately sequential so their artifacts remain
  // independently inspectable for this defect-verification demo.
  workers: 1,
  outputDir: `${artifactDirectory}/test-results`,
  reporter: [['json', { outputFile: `${artifactDirectory}/playwright-results.json` }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on',
    video: 'on'
  },
  webServer: {
    command: 'node demo-app/server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  }
});
