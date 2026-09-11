/**
 * Home window – desktop icon and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const homeDom = () => `
    <div id="home-window" class="window" style="display: none;"></div>
    <div id="home-dock-item" class="dock-item"></div>
    <a id="home-desktop-icon" class="desktop-icon"></a>
`;

describe('HomeApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = homeDom();
        await import('../core/base-app.js');
        await import('../applications/home/home.js');
    });

    beforeEach(() => {
        document.body.innerHTML = homeDom();
        delete window.WindowManager;
    });

    it('desktop icon click opens the home window', () => {
        const app = new window.HomeAppClass();
        const openSpy = vi.spyOn(app, 'open');
        document.getElementById('home-desktop-icon').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(openSpy).toHaveBeenCalled();
    });

    it('openHomeWindow opens HomeApp when present', () => {
        const app = new window.HomeAppClass();
        window.HomeApp = app;
        const openSpy = vi.spyOn(app, 'open');
        window.openHomeWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openHomeWindow no-ops when HomeApp is missing', () => {
        window.HomeApp = undefined;
        expect(() => window.openHomeWindow()).not.toThrow();
    });

    it('open loads the iframe only when the window is opened', () => {
        document.body.innerHTML = `
            ${homeDom()}
            <iframe id="home-iframe" data-src="https://marina.nullstar.fun/" src="about:blank"></iframe>
        `;
        const app = new window.HomeAppClass();
        expect(document.getElementById('home-iframe').getAttribute('src')).toBe('about:blank');
        app.open();
        expect(document.getElementById('home-iframe').getAttribute('src')).toBe('https://marina.nullstar.fun/');
        app.open();
        expect(document.getElementById('home-iframe').getAttribute('src')).toBe('https://marina.nullstar.fun/');
    });

    it('ensureIframeSrc no-ops without an iframe or data-src', () => {
        const app = new window.HomeAppClass();
        expect(() => app.ensureIframeSrc()).not.toThrow();
        document.body.innerHTML = `${homeDom()}<iframe id="home-iframe" src="about:blank"></iframe>`;
        const again = new window.HomeAppClass();
        again.ensureIframeSrc();
        expect(document.getElementById('home-iframe').getAttribute('src')).toBe('about:blank');
    });

    it('setupEventListeners skips desktop icon when it is missing', () => {
        document.body.innerHTML = `
            <div id="home-window" class="window"></div>
            <div id="home-dock-item" class="dock-item"></div>
        `;
        expect(() => new window.HomeAppClass()).not.toThrow();
    });
});
