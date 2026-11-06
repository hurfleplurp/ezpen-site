import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('product links navigate between pages and support history', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'ezPen', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'ggezPen' }).click();
  await expect(page).toHaveURL(/\/ggezpen\.html$/);
  await expect(page.getByRole('heading', { name: 'ggezPen.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'ggezPen', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('ggezPen is a prototype in development. More to come.')).toBeVisible();
  await page.getByRole('link', { name: 'ezPen', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4178/');
  await expect(page.getByRole('heading', { name: 'Easy is better.' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/ggezpen\.html$/);
});

test('game page and product navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4178/ggezpen.html');
    await expect(page.getByRole('heading', { name: 'ggezPen.' })).toBeVisible();
    await page.getByRole('link', { name: 'ezPen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Easy is better.' })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('supported browsers flip in opposite directions between products', async ({ page }) => {
  await page.addInitScript(() => {
    addEventListener('pagereveal', event => {
      const transition = (event as Event & { viewTransition?: { finished: Promise<void> } }).viewTransition;
      if (!transition) return;
      document.documentElement.dataset.flipOld = getComputedStyle(document.documentElement, '::view-transition-old(root)').animationName;
      document.documentElement.dataset.flipNew = getComputedStyle(document.documentElement, '::view-transition-new(root)').animationName;
      void transition.finished.then(() => { document.documentElement.dataset.flipFinished = 'true'; });
    });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'ggezPen' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-flip-old', 'flip-out-left');
  await expect(page.locator('html')).toHaveAttribute('data-flip-new', 'flip-in-right');
  await expect(page.locator('html')).toHaveAttribute('data-flip-finished', 'true');
  await page.getByRole('link', { name: 'ezPen', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-flip-old', 'flip-out-right');
  await expect(page.locator('html')).toHaveAttribute('data-flip-new', 'flip-in-left');
});

for (const width of [320, 390, 768, 1440]) {
  test(`home callout points at the game link at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByText("what's this? :o")).toBeVisible();
    const arrow = await page.locator('.nav-callout svg').boundingBox();
    const text = await page.locator('.nav-callout .handwritten').boundingBox();
    const link = await page.getByRole('link', { name: 'ggezPen' }).boundingBox();
    expect(arrow).not.toBeNull();
    expect(text).not.toBeNull();
    expect(link).not.toBeNull();
    if (!arrow || !text || !link) throw new Error('Missing callout or product link.');
    const tipX = arrow.x + arrow.width * 110 / 130;
    const tipY = arrow.y + arrow.height * 12 / 100;
    const startX = arrow.x + arrow.width * 10 / 130;
    expect(startX - (text.x + text.width)).toBeGreaterThanOrEqual(10);
    expect(tipX).toBeGreaterThan(link.x);
    expect(tipX).toBeLessThan(link.x + link.width);
    expect(tipY - (link.y + link.height)).toBeGreaterThanOrEqual(5);
    expect(tipY - (link.y + link.height)).toBeLessThan(35);
    const captureText = await page.locator('.capture-note span').boundingBox();
    const captureArrow = await page.locator('.capture-note svg').boundingBox();
    if (!captureText || !captureArrow) throw new Error('Missing artwork callout.');
    expect(captureArrow.x - (captureText.x + captureText.width)).toBeGreaterThanOrEqual(12);
    if (width <= 520) {
      expect(text.y + text.height / 2).toBeLessThan(arrow.y + arrow.height * 83 / 100);
      expect(captureText.y + captureText.height / 2).toBeLessThan(captureArrow.y);
    }
    await page.getByRole('link', { name: 'ggezPen' }).click();
    await expect(page).toHaveURL(/\/ggezpen\.html$/);
  });

  test(`game page fits and navigation remains visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ggezpen.html');
    await expect(page.getByRole('link', { name: 'ezPen', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ggezPen', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('reduced motion disables the page flip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('link', { name: 'ggezPen' }).click();
  await expect(page.getByRole('heading', { name: 'ggezPen.' })).toBeVisible();
  const duration = await page.evaluate(() => getComputedStyle(document.documentElement, '::view-transition-new(root)').animationDuration);
  expect(duration).toBe('0s');
});

test('game page meets automated WCAG AA checks', async ({ page }) => {
  await page.goto('/ggezpen.html');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
