import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('QADEMO-102: the reported missing confirmation is reproduced', async ({ page }, testInfo) => {
  await page.goto('/?mode=reproduced');
  await page.getByTestId('profile-name').fill('Synthetic QA user');

  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/profile') && response.request().method() === 'POST'
  );
  await page.getByTestId('save-profile').click();
  const response = await responsePromise;

  await expect(page.getByTestId('save-status')).toHaveText('Unable to save profile');
  await page.screenshot({ path: testInfo.outputPath('reproduced-defect.png'), fullPage: true });
  await writeFile(testInfo.outputPath('verification-observation.json'), JSON.stringify({
    defectObserved: true,
    confirmationVisible: false,
    confirmationText: await page.getByTestId('save-status').textContent(),
    apiStatus: response.status()
  }, null, 2));
});
