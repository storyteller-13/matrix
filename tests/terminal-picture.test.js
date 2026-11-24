/** Terminal image viewer – modal fallbacks, reuse, and close behavior. */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createPictureViewer } from '../applications/terminal/terminal-picture.js';

describe('createPictureViewer', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
        window.ArtworkApp = undefined;
    });

    it('uses its default callback and creates, reuses, and closes the fallback modal', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (callback) => callback());
        vi.stubGlobal('Image', class {
            set src(value) {
                this._src = value;
                this.onload?.();
            }
        });

        const viewer = createPictureViewer();
        createPictureViewer({});
        viewer.close();
        viewer.open('first.png');
        const modal = document.getElementById('terminal-image-modal');
        expect(modal.style.display).toBe('flex');
        expect(modal.querySelectorAll('img')).toHaveLength(1);

        viewer.open('second.png');
        expect(modal.querySelectorAll('img')).toHaveLength(1);
        expect(modal.querySelector('img').getAttribute('src')).toBe('second.png');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        vi.runAllTimers();
        expect(modal.style.display).toBe('none');
    });
});
