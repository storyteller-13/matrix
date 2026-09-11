/**
 * Artwork window – gallery, lightbox, badge, and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const artworkDom = () => `
    <div id="artwork-window" class="window" style="display: none;">
        <div class="file-list"></div>
    </div>
    <div id="artwork-dock-item" class="dock-item"></div>
    <span id="artwork-count-badge" style="display: none;"></span>
    <span id="artwork-menu-count" style="display: none;"></span>
`;

describe('ArtworkApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = artworkDom();
        await import('../core/base-app.js');
        await import('../applications/artwork/artwork.js');
    });

    beforeEach(() => {
        document.body.innerHTML = artworkDom();
        delete window.WindowManager;
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('shows a badge with the image count', () => {
        const app = new window.ArtworkAppClass();
        expect(app.elements.badge.textContent).toBe(String(app.images.length));
        expect(app.elements.badge.style.display).toBe('flex');
        expect(app.elements.menuCount.textContent).toBe(String(app.images.length));
    });

    it('hides the badge when there are no images', () => {
        const app = new window.ArtworkAppClass();
        app.images = [];
        app.updateBadge();
        expect(app.elements.badge.style.display).toBe('none');
        expect(app.elements.menuCount.style.display).toBe('none');
    });

    it('caps the badge at 99+', () => {
        const app = new window.ArtworkAppClass();
        app.images = Array.from({ length: 120 }, (_, i) => `${i}.png`);
        app.updateBadge();
        expect(app.elements.badge.textContent).toBe('99+');
    });

    it('open populates the file list once', () => {
        const app = new window.ArtworkAppClass();
        const openSpy = vi.spyOn(window.BaseApp.prototype, 'open').mockImplementation(() => {});
        app.open();
        const items = document.querySelectorAll('.file-item');
        expect(items.length).toBe(app.images.length);
        expect(items[0].querySelector('img').src).toContain('/pages/artwork/');
        app.open();
        expect(document.querySelectorAll('.file-item').length).toBe(app.images.length);
        openSpy.mockRestore();
    });

    it('clicking a file opens the lightbox', () => {
        const app = new window.ArtworkAppClass();
        vi.spyOn(window.BaseApp.prototype, 'open').mockImplementation(() => {});
        app.open();
        document.querySelector('.file-item').click();
        const modal = document.getElementById('artwork-image-modal');
        expect(modal.style.display).toBe('flex');
        expect(modal.style.opacity).toBe('1');
        expect(modal.querySelector('img').src).toContain('summer.png');
    });

    it('Escape and backdrop click close the lightbox', () => {
        vi.useFakeTimers();
        const app = new window.ArtworkAppClass();
        app.openImage('/pages/artwork/love.png');
        const modal = document.getElementById('artwork-image-modal');
        modal.querySelector('img').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.style.display).toBe('flex');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(300);
        expect(modal.style.display).toBe('none');

        app.openImage('/pages/artwork/love.png');
        modal.click();
        vi.advanceTimersByTime(300);
        expect(modal.style.display).toBe('none');
    });

    it('ensureModal reuses an existing modal', () => {
        const app = new window.ArtworkAppClass();
        const first = app.ensureModal();
        const second = app.ensureModal();
        expect(first).toBe(second);
    });

    it('closeImage no-ops when the modal is missing', () => {
        const app = new window.ArtworkAppClass();
        expect(() => app.closeImage()).not.toThrow();
    });

    it('loadImages no-ops without a file list', () => {
        document.body.innerHTML = `
            <div id="artwork-window" class="window"></div>
            <div id="artwork-dock-item" class="dock-item"></div>
        `;
        const app = new window.ArtworkAppClass();
        expect(() => app.loadImages()).not.toThrow();
        expect(app.fileListPopulated).toBe(false);
    });

    it('init returns early when the window is missing', () => {
        document.body.innerHTML = '';
        const app = new window.ArtworkAppClass();
        expect(app.window).toBeNull();
    });

    it('openArtworkWindow opens ArtworkApp when present', () => {
        const app = new window.ArtworkAppClass();
        window.ArtworkApp = app;
        const openSpy = vi.spyOn(app, 'open').mockImplementation(() => {});
        window.openArtworkWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openArtworkWindow no-ops when ArtworkApp is missing', () => {
        window.ArtworkApp = undefined;
        expect(() => window.openArtworkWindow()).not.toThrow();
    });

    it('updateBadge skips missing badge nodes', () => {
        document.body.innerHTML = `<div id="artwork-window" class="window"></div>`;
        const app = new window.ArtworkAppClass();
        expect(() => app.updateBadge()).not.toThrow();
    });
});
