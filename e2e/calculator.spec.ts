import { test, expect } from '@playwright/test';
async function compute(
  page: import('@playwright/test').Page,
  expression: string,
) {
  await page.getByRole('textbox', { name: 'Expression' }).fill(expression);
  await page.getByRole('textbox', { name: 'Expression' }).press('Enter');
}
async function openHistory(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Open history' });
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute('aria-expanded')) === 'false'
  )
    await toggle.click();
}
test('scientific arithmetic, memory, settings, and persistent history', async ({
  page,
}) => {
  await page.goto('/');
  await compute(page, '2^3^2');
  await expect(page.getByLabel('Calculator display')).toHaveText('512');
  await compute(page, 'sin(30)');
  await expect(page.getByLabel('Calculator display')).toHaveText('0.5');
  await page.getByRole('button', { name: 'Store in memory' }).click();
  await page.getByRole('button', { name: 'RAD', exact: true }).click();
  await compute(page, 'sin(pi/2)');
  await expect(page.getByLabel('Calculator display')).toHaveText('1');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Result precision' })
    .selectOption('8');
  await page.getByRole('checkbox', { name: 'Enable animations' }).uncheck();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'RAD', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Recall memory' }).click();
  await expect(page.getByRole('textbox', { name: 'Expression' })).toHaveValue(
    '(0.5)',
  );
  await openHistory(page);
  await expect(
    page.getByRole('button', { name: 'Replay sin(30)' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pin sin(30)', exact: true }).click();
  await page.getByRole('searchbox').fill('sin(30)');
  await expect(page.getByRole('button', { name: 'Replay 2^3^2' })).toHaveCount(
    0,
  );
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export ↗' }).click();
  expect((await download).suggestedFilename()).toBe('smartcalc-history.json');
  await page.getByRole('button', { name: 'Replay sin(30)' }).click();
  await page.getByRole('button', { name: 'Equals', exact: true }).click();
  await expect(page.getByLabel('Calculator display')).toHaveText('0.5');
  await openHistory(page);
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page.getByRole('button', { name: 'Delete all', exact: true }).click();
  await page.reload();
  await openHistory(page);
  await expect(page.getByText('Room for your next idea.')).toBeVisible();
});
test('domain errors, touch functions, small screens, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.goto('/');
  for (const [expression, message] of [
    ['10/0', 'Cannot divide by zero.'],
    ['sqrt(-9)', 'Square root requires a non-negative value.'],
    ['tan(90)', 'Tangent is undefined at this angle.'],
  ]) {
    await compute(page, expression);
    await expect(page.getByText(message)).toBeVisible();
  }
  await page.getByRole('button', { name: 'All clear' }).click();
  await page.getByRole('button', { name: '9', exact: true }).click();
  await page.getByRole('button', { name: 'Square root', exact: true }).click();
  await page.getByRole('button', { name: 'Equals' }).click();
  await expect(page.getByLabel('Calculator display')).toHaveText('3');
  await page.setViewportSize({ width: 320, height: 900 });
  await compute(page, '200!');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator('.pro-key')
      .evaluateAll((keys) =>
        Math.min(...keys.map((key) => key.getBoundingClientRect().height)),
      ),
  ).toBeGreaterThanOrEqual(44);
  expect(
    await page
      .getByLabel('Calculator display')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(runtimeErrors).toEqual([]);
});
test('v1 migration preserves backup and replay uses the original Ans', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('seeded')) {
      localStorage.setItem(
        'smartcalc.history.v1',
        JSON.stringify([
          {
            id: 'legacy',
            operandA: '1',
            operator: '+',
            operandB: '2',
            result: '3',
            createdAt: '2026-11-17T15:00:00Z',
          },
        ]),
      );
      localStorage.setItem('seeded', 'true');
    }
  });
  await page.goto('/');
  await openHistory(page);
  await expect(
    page.getByRole('button', { name: 'Replay 1+(2)', exact: true }),
  ).toBeVisible();
  const close = page.getByRole('button', { name: 'Close history' });
  if (await close.isVisible()) await close.click();
  await compute(page, '5');
  await compute(page, 'Ans+2');
  await compute(page, '99');
  await openHistory(page);
  await page.getByRole('button', { name: 'Replay Ans+2' }).click();
  await page.getByRole('button', { name: 'Equals' }).click();
  await expect(page.getByLabel('Calculator display')).toHaveText('7');
  expect(
    await page.evaluate(() => localStorage.getItem('smartcalc.history.v1')),
  ).not.toBeNull();
});
