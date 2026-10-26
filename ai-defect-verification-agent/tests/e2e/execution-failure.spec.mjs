import { test } from '@playwright/test';

test('QADEMO-104: synthetic Playwright execution failure', async ({ page }) => {
  await page.goto('/');
  throw new Error('Synthetic browser-automation failure for execution-failure classification.');
});
