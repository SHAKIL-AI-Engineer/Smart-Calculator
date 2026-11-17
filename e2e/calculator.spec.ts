import { test, expect } from '@playwright/test';
test('calculate, persist through reload, clear history, and fit the viewport', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.type('0.1+0.2=');
  await expect(page.getByLabel('Calculator display')).toHaveText('0.3');
  await expect(
    page.getByRole('complementary').getByText('= 0.3', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('complementary').getByText('= 0.3', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear history' }).click();
  await expect(page.getByText('A fresh start.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('A fresh start.')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test('touch controls, zero division recovery, and long results', async ({
  page,
}) => {
  await page.goto('/');
  for (const name of ['9', 'Divide', '0', 'Equals'])
    await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByText('Cannot divide by zero.')).toBeVisible();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Equals', exact: true }).click();
  await expect(page.getByLabel('Calculator display')).toHaveText('3');
  await page.keyboard.press('Escape');
  await page.keyboard.type('9999999999999999*1=');
  await expect(page.getByLabel('Calculator display')).toHaveText(
    '9,999,999,999,999,999',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
