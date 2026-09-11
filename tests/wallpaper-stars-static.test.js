/**
 * Wallpaper stars – reduced motion skips animations
 */
import { describe, it, expect, beforeAll } from 'vitest';

describe('wallpaper-stars with reduced motion', () => {
    beforeAll(async () => {
        window.matchMedia = (query) => ({
            matches: String(query).includes('prefers-reduced-motion'),
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

    it('adds a static lite field without animation', () => {
        const root = document.querySelector('.wallpaper-stars');
        const stars = root.querySelectorAll('.wallpaper-star');
        expect(root.classList.contains('is-lite')).toBe(true);
        expect(root.classList.contains('is-static')).toBe(true);
        expect(stars.length).toBeGreaterThan(20);
        expect(stars.length).toBeLessThan(80);
        expect(stars[0].style.animation).toBe('');
    });
});
