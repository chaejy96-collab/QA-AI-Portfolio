import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('QADEMO-103: execution passes without the required screenshot evidence', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('profile-name').fill('Synthetic QA user');

  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/profile') && response.request().method() === 'POST'
  );
  await page.getByTestId('save-profile').click();
  const response = await responsePromise;

  await expect(page.getByTestId('save-status')).toHaveText('Profile saved');
  // Screenshot collection is intentionally omitted: C3 must therefore remain unproven.
  await writeFile(testInfo.outputPath('verification-observation.json'), JSON.stringify({
    confirmationVisible: true,
    confirmationText: await page.getByTestId('save-status').textContent(),
    apiStatus: response.status()
  }, null, 2));
});
