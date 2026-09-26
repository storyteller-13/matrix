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
        const stars = document.querySelectorAll('.wallpaper-stars .wallpaper-star');
        expect(stars.length).toBeGreaterThan(300);
        const first = stars[0];
        expect(first.style.left).toMatch(/%$/);
        expect(first.style.top).toMatch(/%$/);
        expect(first.querySelector('svg use')).toBeTruthy();
    });
});
