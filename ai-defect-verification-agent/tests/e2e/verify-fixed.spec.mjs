import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('QADEMO-101: displays success feedback after profile save', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('profile-name').fill('Synthetic QA user');

  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/profile') && response.request().method() === 'POST'
  );
  await page.getByTestId('save-profile').click();
  const response = await responsePromise;

  await expect(page.getByTestId('save-status')).toHaveText('Profile saved');
  await page.screenshot({ path: testInfo.outputPath('fixed-state.png'), fullPage: true });
  await writeFile(testInfo.outputPath('verification-observation.json'), JSON.stringify({
    confirmationVisible: true,
    confirmationText: await page.getByTestId('save-status').textContent(),
    apiStatus: response.status()
  }, null, 2));
});
