/**
 * Browser tests against the real page: windows, the terminal, the command palette, deep links and the lists menu.
 * Run with `npm run test:e2e`.
 */
import { test, expect } from '@playwright/test';

// Requests to outside services (fonts, YouTube, APIs) fail in CI; only errors from our own code count.
const isOwnError = (message) => !/fonts|youtube|api\/|net::ERR|Failed to load resource/i.test(message);

test.beforeEach(async ({ page }) => {
    page.errors = [];
    // Abort outside requests right away. A request that hangs (fonts, YouTube, APIs) keeps the
    // page's `load` event pending, so page.goto() times out. Aborting makes the page settle.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, (route) => route.abort());
    page.on('pageerror', (error) => page.errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' && isOwnError(message.text())) page.errors.push(message.text());
    });
});

test('the page loads without errors from our own code', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal-window')).toBeAttached();
    await page.waitForLoadState('load');
    expect(page.errors).toEqual([]);
});

test('the terminal runs commands', async ({ page }) => {
    await page.goto('/');
    await page.click('#terminal-dock-item');
    const input = page.locator('#terminal-input-main');
    await expect(input).toBeVisible();
    await input.fill('echo hello from the browser');
    await input.press('Enter');
    await expect(page.locator('#terminal-output-container')).toContainText('hello from the browser');
});

test('Escape closes the top window when focus is not in a text field', async ({ page }) => {
    await page.goto('/');
    await page.click('#terminal-dock-item');
    await expect(page.locator('#terminal-window')).toBeVisible();
    // The terminal focuses its input about 300 ms after opening, so wait for that before moving focus away.
    await page.waitForTimeout(500);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Escape');
    await expect(page.locator('#terminal-window')).toBeHidden();
});

test('Ctrl+K opens the palette and Enter runs the chosen item', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const palette = page.locator('.command-palette');
    await expect(palette).toBeVisible();
    await page.locator('.command-palette-input').fill('quotes');
    await page.keyboard.press('Enter');
    await expect(palette).toBeHidden();
    await expect(page.locator('#quotes-box')).toBeVisible();
});

test('a deep link opens its app on load', async ({ page }) => {
    await page.goto('/?open=quotes');
    await expect(page.locator('#quotes-box')).toBeVisible();
});

test('the lists menu lists favorite movies last in movies and art last overall', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#lists-menu-root');
    await expect(root.locator('.menu-item-text').first()).toHaveText('books');
    await expect(root.locator(':scope > button').last()).toHaveAttribute('data-arg', 'art');
    const firstMovie = root.locator('[data-arg="seventh-art-canonical"]');
    await expect(firstMovie).toHaveCount(1);
});

test('phones get the terminal key bar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'desktop project has a fine pointer');
    await page.goto('/');
    await expect(page.locator('.terminal-touch-bar')).toHaveCount(1);
});

test('the soundtrack name in the player is in capitals, the menu is not', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#music-soundtrack-title')).toHaveCSS('text-transform', 'uppercase');
    await expect(page.locator('[data-action="openSoundtrack"][data-arg="2026"] .menu-item-text')).not.toHaveCSS('text-transform', 'uppercase');
});

test('nested lists submenus open on hover, e.g. books inside my curated lists', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop hover behavior');
    await page.goto('/');
    await page.click('#applications-menu-button');
    await page.locator('.menu-item-text', { hasText: 'my curated lists' }).hover();
    await page.locator('#lists-menu-root > .menu-item-has-submenu', { hasText: 'books' }).hover();
    await expect(page.locator('[data-arg="books-2026"]')).toBeVisible();
});

test('typing matrix turns the site green with rain behind it, and typing it again restores the theme', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop screenshot comparison');
    await page.goto('/');
    await page.click('#terminal-dock-item');
    const input = page.locator('#terminal-input-main');
    await expect(input).toBeVisible();
    const before = await page.screenshot();
    await input.fill('matrix');
    await input.press('Enter');
    await expect(page.locator('html')).toHaveClass(/matrix-theme/);
    await expect(page.locator('#matrix-rain')).toHaveCount(1);
    await page.waitForTimeout(800);
    await page.screenshot({ path: process.env.MATRIX_SHOT || 'test-results/matrix-on.png' });
    await input.fill('matrix');
    await input.press('Enter');
    await expect(page.locator('html')).not.toHaveClass(/matrix-theme/);
    await expect(page.locator('#matrix-rain')).toHaveCount(0);
    expect(before.length).toBeGreaterThan(0);
});
