/**
 * Wallpaper stars exits quietly when the wallpaper root is absent.
 */
import { describe, it, expect } from 'vitest';

describe('wallpaper-stars without root', () => {
    it('does not throw or add stars when .wallpaper-stars is missing', async () => {
        document.body.innerHTML = '<div id="app"></div>';
        await import('../core/wallpaper-stars.js');
        expect(document.querySelectorAll('.wallpaper-star').length).toBe(0);
    });
});
