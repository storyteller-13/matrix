/**
 * Wallpaper stars – extra stars are appended into the wallpaper root
 */
import { describe, it, expect, beforeAll } from 'vitest';

describe('wallpaper-stars', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <svg class="wallpaper-star-symbol" viewBox="0 0 24 24">
                <symbol id="wallpaper-star-shape"><path d="M12 1Z"/></symbol>
            </svg>
            <div class="wallpaper-stars"></div>
        `;
        await import('../core/wallpaper-stars.js');
    });

    it('appends extra wallpaper stars into the root', () => {
        const stars = [...document.querySelectorAll('.wallpaper-stars .wallpaper-star')]
            .filter((star) => !/\bstar-\d+\b/.test(star.className));
        expect(stars.length).toBeGreaterThan(300);
        const first = stars[0];
        expect(first.style.left).toMatch(/%$/);
        expect(first.style.top).toMatch(/%$/);
        expect(first.querySelector('svg use')).toBeTruthy();
    });

    it('creates the 72 CSS-positioned stars from the wallpaper module', () => {
        expect(document.querySelectorAll('.wallpaper-stars .wallpaper-star[class*="star-"]').length).toBe(72);
        expect(document.querySelector('.wallpaper-star.star-1 svg use').getAttribute('fill')).toBe('#FF85A2');
        expect(document.querySelector('.wallpaper-star.star-72 svg use').getAttribute('fill')).toBe('#F9A8C9');
    });
});
