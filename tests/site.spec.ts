import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publicHttpsUrl } from '../src/urls';

test('web logos preserve the complete original silhouette with transparent margins', async ({ page }) => {
  await page.goto('/');
  for (const [original, asset] of [['ezPenMaster.png', 'ezpen.png'], ['ezPenMaster_white.png', 'ezpen-white.png']]) {
    const result = await page.evaluate(async ({ original, asset }) => {
      const load = async (src: string): Promise<HTMLImageElement> => {
        const image = new Image();
        image.src = src;
        await image.decode();
        return image;
      };
      const source = await load(`/Logos/${original}`);
      const web = await load(`/brand/${asset}`);
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image comparison context unavailable.');
      context.drawImage(source, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = source.width, top = source.height, right = 0, bottom = 0;
      for (let y = 0; y < source.height; y++) {
        for (let x = 0; x < source.width; x++) {
          if (pixels[(y * source.width + x) * 4 + 3] > 0) {
            left = Math.min(left, x); top = Math.min(top, y);
            right = Math.max(right, x); bottom = Math.max(bottom, y);
          }
        }
      }
      canvas.width = 272;
      canvas.height = 198;
      context.drawImage(source, left, top, right - left + 1, bottom - top + 1, 8, 8, 256, 181);
      const expected = context.getImageData(0, 0, 272, 198).data;
      context.clearRect(0, 0, 272, 198);
      context.drawImage(web, 0, 0);
      const actual = context.getImageData(0, 0, 272, 198).data;
      let mismatches = 0, edgeInk = 0;
      for (let y = 0; y < 198; y++) {
        for (let x = 0; x < 272; x++) {
          const alpha = (y * 272 + x) * 4 + 3;
          if ((expected[alpha] > 127) !== (actual[alpha] > 127)) mismatches++;
          if ((x < 4 || x >= 268 || y < 4 || y >= 194) && actual[alpha] > 0) edgeInk++;
        }
      }
      return { mismatchRatio: mismatches / (272 * 198), edgeInk };
    }, { original, asset });
    expect(result.mismatchRatio, `${asset} must match the full original artwork`).toBeLessThan(.025);
    expect(result.edgeInk, `${asset} must have unclipped transparent margins`).toBe(0);
  }
});

test('page loads cleanly, navigation works, and no pretend download is offered', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/ezPen/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Less fuss.More drawing.');
  await page.getByRole('link', { name: 'Get ezPen for Windows' }).click();
  await expect(page).toHaveURL(/#download$/);
  await expect(page.getByText('Windows release in preparation')).toBeVisible();
  await expect(page.locator('#download-action a')).toHaveCount(0);
  await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
  const brokenImages = await page.locator('img').evaluateAll(images =>
    images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  expect(brokenImages).toEqual([]);
  expect(errors).toEqual([]);
});

test('hero reserves space for a real asset without a browser drawing imitation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img[src*="ezpen-hero.png"]')).toBeVisible();
  await expect(page.getByText('Your ezPen capture goes here.')).toHaveCount(0);
  await expect(page.locator('.product-media-placeholder')).toHaveCount(0);
  await expect(page.locator('canvas, .sketch-toolbar, .board-art, #drawing-status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /ink|undo drawing|redo drawing|clear your drawing/i })).toHaveCount(0);
  await expect(page.getByText('Try a scribble.', { exact: false })).toHaveCount(0);
});

test('configured public download, release notes and canonical URL are wired', async ({ page }) => {
  await page.goto('http://127.0.0.1:4179/');
  await expect(page.getByText('Windows release in preparation')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Download ezPen for Windows' })).toHaveAttribute('href', 'https://downloads.example.com/ezPen.exe');
  await expect(page.getByRole('link', { name: 'Release notes' })).toHaveAttribute('href', 'https://example.com/releases');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://example.com/');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://example.com/');
});

test('download configuration rejects unsafe or malformed links', () => {
  expect(publicHttpsUrl(undefined, 'download')).toBeNull();
  expect(publicHttpsUrl('  ', 'download')).toBeNull();
  expect(publicHttpsUrl(' https://example.com/app.exe ', 'download')).toBe('https://example.com/app.exe');
  for (const url of ['http://example.com/app.exe', 'javascript:alert(1)', 'https://user:password@example.com/app.exe', 'not a URL']) {
    expect(() => publicHttpsUrl(url, 'download')).toThrow();
  }
});

test('the seven pens and three features use real application icons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pen-shelf li')).toHaveText(['Fineliner', 'Pencil', 'Paintbrush', 'Marker', 'Chisel', 'Chalk', 'Chalk marker']);
  expect(await page.locator('.pen-shelf img').evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(['/icons/fineliner.png', '/icons/pencil.png', '/icons/brush.png', '/icons/marker.png', '/icons/marker.png', '/icons/chalk.png', '/icons/marker.png']);
  expect(await page.locator('.feature-icon img').evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(['/icons/fit-all.png', '/icons/undo.png', '/icons/eyedropper.png']);
  const icons = await page.locator('img[src^="/icons/"]').evaluateAll(images => images.map(image => ({
    loaded: image.complete && image.naturalWidth > 0,
    ratio: image.naturalWidth / image.naturalHeight,
    expectedRatio: Number(image.getAttribute('width')) / Number(image.getAttribute('height')),
  })));
  expect(icons).toHaveLength(10);
  for (const icon of icons) {
    expect(icon.loaded).toBe(true);
    expect(icon.ratio).toBeCloseTo(icon.expectedRatio, 3);
  }
  await expect(page.locator('#pen-art, [role="tablist"]')).toHaveCount(0);
});

test('practical details stay tucked away and open with the keyboard', async ({ page }) => {
  await page.goto('/');
  const question = page.locator('summary').filter({ hasText: 'A few details' });
  await expect(page.getByText('Boards stay on your computer', { exact: false })).not.toBeVisible();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Boards stay on your computer', { exact: false })).toBeVisible();
  await expect(page.locator('summary')).toHaveCount(1);
});

test('copy stays short, with chalk accents instead of feature essays', async ({ page }) => {
  await page.goto('/');
  const count = await page.locator('body').innerText();
  expect(count.trim().split(/\s+/).length).toBeLessThanOrEqual(230);
  await page.locator('summary').click();
  const expanded = await page.locator('body').innerText();
  expect(expanded.trim().split(/\s+/).length).toBeLessThanOrEqual(310);
  expect(await page.locator('.chalk-line').count()).toBeGreaterThanOrEqual(7);
  await expect(page.locator('body')).toHaveCSS('background-image', /board-grain\.svg/);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('img[src*="ezpen-hero.png"]')).toBeVisible();
    for (const icon of await page.locator('.pen-shelf img').all()) {
      await icon.scrollIntoViewIfNeeded();
      await expect(icon).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('surfaces remain dark and blue-grey under both system preferences', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    expect(await page.locator('html').evaluate(element => getComputedStyle(element).colorScheme)).toBe('dark');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#14171f');
    await expect(page.locator('.brand img').first()).toHaveAttribute('src', '/brand/ezpen-white.png');
    for (const selector of ['html', '.release-status']) {
      const channels = await page.locator(selector).evaluate(element => {
        const values = getComputedStyle(element).backgroundColor.match(/\d+/g);
        if (!values) throw new Error('Missing surface colour.');
        return values.slice(0, 3).map(Number);
      });
      expect(Math.max(...channels), `${selector} must remain dark`).toBeLessThan(80);
      expect(channels[2], `${selector} must use a blue, not green, base`).toBeGreaterThan(channels[1]);
    }
    const palette = await page.locator('html').evaluate(element => {
      const style = getComputedStyle(element);
      return { cyan: style.getPropertyValue('--cyan').trim(), pink: style.getPropertyValue('--pink').trim() };
    });
    expect(palette).toEqual({ cyan: '#60d9ed', pink: '#f28bd5' });
  }
});

test('desktop and mobile meet automated WCAG AA checks', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('summary').first().click();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});
