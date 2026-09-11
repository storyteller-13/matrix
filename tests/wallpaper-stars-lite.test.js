/**
 * Wallpaper stars – tablets and phones get a lighter field
 */
import { describe, it, expect, beforeAll } from 'vitest';

describe('wallpaper-stars on constrained devices', () => {
    beforeAll(async () => {
        window.matchMedia = (query) => ({
            matches: String(query).includes('pointer: coarse'),
            addListener() {},
            removeListener() {},
        });
        document.body.innerHTML = `
            <svg class="wallpaper-star-symbol" viewBox="0 0 24 24">
                <symbol id="wallpaper-star-shape"><path d="M12 1Z"/></symbol>
            </svg>
            <div class="wallpaper-stars"></div>
        `;
        await import('../core/wallpaper-stars.js');
    });

    it('adds a lite field of CSS dots instead of hundreds of SVGs', () => {
        const root = document.querySelector('.wallpaper-stars');
        const stars = root.querySelectorAll('.wallpaper-star');
        expect(root.classList.contains('is-lite')).toBe(true);
        expect(stars.length).toBeGreaterThan(50);
        expect(stars.length).toBeLessThan(150);
        expect(stars[0].classList.contains('is-dot')).toBe(true);
        expect(stars[0].querySelector('svg')).toBeNull();
    });

    it('pauses star animations while the tab is hidden', () => {
        const root = document.querySelector('.wallpaper-stars');
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(root.classList.contains('is-paused')).toBe(true);
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(root.classList.contains('is-paused')).toBe(false);
    });
});
