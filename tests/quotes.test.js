/**
 * Quotes panel – display, hide, toggle, empty list, and mobile layout
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const quotesDom = () => `
    <div id="quotes-box" style="display: none;">
        <button id="quotes-box-close"></button>
        <div id="quotes-quote-container"></div>
        <div id="quotes-quote-author"></div>
    </div>
`;

describe('QuotesPanel', () => {
    beforeAll(async () => {
        window.matchMedia = window.matchMedia || (() => ({
            matches: false,
            addListener() {},
            removeListener() {},
        }));
        document.body.innerHTML = quotesDom();
        await import('../core/env.js');
        await import('../applications/quotes/quotes-data.js');
        await import('../applications/quotes/quotes.js');
    });

    beforeEach(() => {
        document.body.innerHTML = quotesDom();
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
        window.I18n = undefined;
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('shows a quote on init', () => {
        new window.QuotesPanelClass();
        expect(document.getElementById('quotes-box').style.display).toBe('block');
        expect(document.getElementById('quotes-quote-container').textContent.length).toBeGreaterThan(0);
        expect(document.getElementById('quotes-quote-author').textContent).toMatch(/^— /);
    });

    it('close button and Escape hide the box', async () => {
        vi.useFakeTimers();
        const panel = new window.QuotesPanelClass();
        document.getElementById('quotes-box-close').click();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('quotes-box').style.display).toBe('none');

        panel.showBox();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('quotes-box').style.display).toBe('none');
    });

    it('toggleVisibility shows and hides the box', async () => {
        vi.useFakeTimers();
        const panel = new window.QuotesPanelClass();
        panel.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('quotes-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('quotes-box').style.display).toBe('block');
    });

    it('openQuotesWindow toggles the panel', () => {
        const panel = new window.QuotesPanelClass();
        window.QuotesPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openQuotesWindow();
        expect(spy).toHaveBeenCalled();
    });

    it('openQuotesWindow no-ops when the panel is missing', () => {
        window.QuotesPanel = undefined;
        expect(() => window.openQuotesWindow()).not.toThrow();
    });

    it('returns a fallback quote when the list is empty', () => {
        const panel = new window.QuotesPanelClass();
        panel.quotes = [];
        expect(panel.getRandomQuote()).toEqual({ text: 'No quotes loaded.', author: '' });
        panel.displayQuote();
        expect(document.getElementById('quotes-quote-author').textContent).toBe('');
        window.I18n = { t: () => 'ことばがまだないよ。' };
        expect(panel.getRandomQuote()).toEqual({ text: 'ことばがまだないよ。', author: '' });
        window.I18n = undefined;
    });

    it('uses a centered transform on mobile', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const panel = new window.QuotesPanelClass();
        expect(panel.isMobile()).toBe(true);
        expect(document.getElementById('quotes-box').style.display).not.toBe('block');
        panel.showBox();
        expect(document.getElementById('quotes-box').style.transform).toContain('translate(-50%, -50%)');
    });

    it('isMobile is false when matchMedia is missing', () => {
        const original = window.matchMedia;
        delete window.matchMedia;
        const panel = new window.QuotesPanelClass();
        expect(panel.isMobile()).toBe(false);
        window.matchMedia = original;
    });

    it('stays closed on a tablet-sized coarse pointer', () => {
        window.matchMedia = (query) => ({
            matches: String(query).includes('pointer: coarse'),
            addListener() {},
            removeListener() {},
        });
        const panel = new window.QuotesPanelClass();
        expect(panel.isMobile()).toBe(false);
        expect(panel.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('quotes-box').style.display).not.toBe('block');
    });

    it('stays closed when desktop panels should not auto-open', () => {
        const originalEnv = window.Env;
        window.Env = { shouldAutoOpenDesktopPanels: () => false };
        const panel = new window.QuotesPanelClass();
        expect(panel.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('quotes-box').style.display).not.toBe('block');
        expect(document.getElementById('quotes-quote-container').textContent.length).toBeGreaterThan(0);
        window.Env = originalEnv;
    });

    it('helpers no-op when the box is missing', () => {
        document.body.innerHTML = '';
        const panel = new window.QuotesPanelClass();
        expect(() => panel.displayQuote()).not.toThrow();
        expect(() => panel.toggleVisibility()).not.toThrow();
        expect(() => panel.showBox()).not.toThrow();
        expect(() => panel.hideBox()).not.toThrow();
    });

    it('init skips the close button when it is missing', () => {
        document.body.innerHTML = `
            <div id="quotes-box">
                <div id="quotes-quote-container"></div>
            </div>
        `;
        expect(() => new window.QuotesPanelClass()).not.toThrow();
    });
});
