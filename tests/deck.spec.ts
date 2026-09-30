import { test, expect } from '@playwright/test';
test('browse five ideas, hold to read, select, and return', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('article')).toHaveAttribute(
    'aria-label',
    'Video idea 1 of 5',
  );
  await expect(page.locator('.thumbnail img').first()).toHaveJSProperty(
    'naturalWidth',
    1024,
  );
  for (let i = 2; i <= 5; i++) {
    await page.getByRole('button', { name: 'Next idea', exact: true }).click();
    await expect(page.getByRole('article')).toHaveAttribute(
      'aria-label',
      `Video idea ${i} of 5`,
    );
  }
  await page.getByRole('button', { name: 'Next idea', exact: true }).click();
  await expect(page.getByRole('article')).toHaveAttribute('aria-label', 'Video idea 1 of 5');
  await expect(page.getByRole('article')).not.toHaveClass(/exiting/);
  const card = await page.getByRole('article').boundingBox();
  if (!card) throw new Error('Missing card');
  await page.mouse.move(card.x + card.width / 2, card.y + 100);
  await page.mouse.down();
  await page.waitForTimeout(3100);
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Alignment', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Make this next', exact: true })
    .click();
  await page.screenshot({
    path: 'artifacts/desktop-report.png',
    fullPage: true,
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'View report' }).click();
  await expect(
    page.getByRole('button', { name: 'Selected as your next video' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.mouse.move(card.x + card.width / 2, card.y + 100);
  await page.mouse.down();
  await page.mouse.move(card.x + card.width / 2 - 160, card.y + 100, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(page.getByRole('article')).toHaveAttribute(
    'aria-label',
    'Video idea 2 of 5',
  );
  await page.screenshot({ path: 'artifacts/desktop-deck.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('mobile report scrolls and dismisses only at the top', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173');
  await page.screenshot({ path: 'artifacts/mobile-deck.png' });
  await page.getByRole('button', { name: 'View report' }).click();
  await page.locator('.report-scroll').evaluate((el) => {
    el.scrollTop = 500;
  });
  const swipe = async () => {
    await page.locator('.report-scroll').dispatchEvent('touchstart', {
      touches: [{ identifier: 1, clientX: 100, clientY: 100 }],
    });
    await page.locator('.report-scroll').dispatchEvent('touchend', {
      changedTouches: [{ identifier: 1, clientX: 100, clientY: 250 }],
    });
  };
  await swipe();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: 'artifacts/mobile-report.png' });
  await page.locator('.report-scroll').evaluate((el) => {
    el.scrollTop = 0;
  });
  await swipe();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  await context.close();
});

test('direction overlays and fly-out animation match the demo', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:5173');
  const card = page.getByRole('article');
  const box = await card.boundingBox();
  if (!box) throw new Error('Missing card');
  await expect(
    page.getByRole('navigation', { name: 'Deck progress' }).getByRole('button'),
  ).toHaveCount(5);
  for (const direction of [-1, 1]) {
    await page.mouse.move(box.x + box.width / 2, box.y + 150);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + direction * 150,
      box.y + 150,
      { steps: 8 },
    );
    const overlay = card.getByTestId('drag-overlay');
    await expect(overlay).toHaveCSS(
      'background-color',
      direction < 0 ? 'rgb(244, 67, 54)' : 'rgb(0, 191, 165)',
    );
    await page.screenshot({
      path:
        direction < 0 ? 'artifacts/drag-left.png' : 'artifacts/drag-right.png',
    });
    await page.mouse.up();
    await expect(card).toHaveClass(/exiting/);
    await expect(card).not.toHaveClass(/exiting/);
  }
  await expect(card).toHaveAttribute('aria-label', 'Video idea 1 of 5');
});
