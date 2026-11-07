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

test('game page uses the local Proggy font and a light title band', async ({ page }) => {
  await page.goto('/ggezpen.html');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px "Proggy Square"'))).toBe(true);
  for (const selector of ['.brand', '.product-nav', '.game-eyebrow', '#game-title', '.game-tagline', '.game-summary', '.game-art-label', '.game-feature-number', '.game-feature-list p', '.site-footer']) {
    await expect(page.locator(selector).first()).toHaveCSS('font-family', /^"Proggy Square"/);
  }
  await expect(page.locator('.site-header .brand img')).toHaveAttribute('src', '/brand/ezpen.png');
  await expect(page.locator('.site-footer .brand img')).toHaveAttribute('src', '/brand/ezpen-white.png');
  const band = await page.locator('.game-hero').evaluate(element => getComputedStyle(element, '::before').backgroundColor);
  expect(band).toBe('rgb(170, 169, 173)');
  await expect(page.locator('#game-title')).toHaveCSS('color', 'rgb(23, 19, 34)');
  const response = await page.request.get('/fonts/ProggySquare.ttf');
  expect(response.ok()).toBe(true);
});

test('all game text uses whole multiples of the Proggy Square pixel size', async ({ page }) => {
  for (const width of [320, 390, 520, 521, 760, 761, 1000, 1099, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ggezpen.html');
    const invalid = await page.evaluate(() => Array.from(document.body.querySelectorAll('*'))
      .filter(element => Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()))
      .map(element => ({ element: element.tagName + (element.className ? `.${element.className}` : ''), size: parseFloat(getComputedStyle(element).fontSize) }))
      .filter(({ size }) => size % 16 !== 0));
    expect(invalid, `Invalid font sizes at ${width}px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `Overflow at ${width}px`).toBeLessThanOrEqual(width);
  }
});

test('gameplay loop sits below the ribbon and plays the supplied footage', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/ggezpen.html');
  const image = page.locator('.game-footage img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', '/screenshots/ggezpen-gameplay.apng');
  const response = await request.get('/screenshots/ggezpen-gameplay.apng');
  expect(response.ok()).toBe(true);
  const bytes = await response.body();
  const animationControl = bytes.indexOf(Buffer.from('acTL'));
  expect(animationControl).toBeGreaterThan(0);
  expect(bytes.readUInt32BE(animationControl + 4)).toBe(307);
  expect(bytes.readUInt32BE(animationControl + 8)).toBe(0);
  expect(await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight })))
    .toEqual({ width: 799, height: 453 });
  const firstFrame = await image.screenshot();
  await page.waitForTimeout(1500);
  expect(await image.screenshot()).not.toEqual(firstFrame);
  for (const width of [320, 390, 760, 761, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const footage = await image.boundingBox();
    const art = await page.locator('.game-art').boundingBox();
    const intro = await page.locator('.game-intro').boundingBox();
    const features = await page.locator('.game-features').boundingBox();
    if (!footage || !art || !intro || !features) throw new Error('Missing gameplay hero layout.');
    expect(footage.y).toBeGreaterThanOrEqual(art.y + art.height + 20);
    expect(footage.y + footage.height).toBeLessThan(features.y);
    expect(footage.width / footage.height).toBeCloseTo(799 / 453, 1);
    if (width > 760) {
      expect(footage.x).toBeGreaterThanOrEqual(intro.x + intro.width);
    } else {
      expect(art.y).toBeGreaterThanOrEqual(intro.y + intro.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => image.evaluate(element => element.currentSrc)).toContain('/screenshots/ggezpen-gameplay-poster.png');
  const poster = await request.get('/screenshots/ggezpen-gameplay-poster.png');
  expect(poster.ok()).toBe(true);
  expect((await poster.body()).indexOf(Buffer.from('acTL'))).toBe(-1);
  const still = await image.screenshot();
  await page.waitForTimeout(500);
  expect(await image.screenshot()).toEqual(still);
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
    const artwork = await page.locator('.product-figure > img').boundingBox();
    if (!artwork) throw new Error('Missing hero artwork.');
    const arrowTip = await page.locator('.capture-note path').evaluate(path => {
      const svg = path.ownerSVGElement;
      if (!svg) throw new Error('Missing arrow SVG.');
      const point = svg.createSVGPoint();
      point.x = 61;
      point.y = 37;
      const matrix = svg.getScreenCTM();
      if (!matrix) throw new Error('Missing arrow transform.');
      return point.matrixTransform(matrix).x;
    });
    expect(arrowTip).toBeGreaterThan(artwork.x + artwork.width * .4);
    expect(arrowTip).toBeLessThan(artwork.x + artwork.width * .9);
    expect(captureText.x).toBeGreaterThanOrEqual(0);
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
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ggezpen.html');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }
});
