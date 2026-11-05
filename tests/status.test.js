/**
 * Current status window – lazy iframe and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const statusDom = () => `
    <div id="status-window" class="window" style="display: none;"></div>
`;

describe('StatusApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = statusDom();
        await import('../core/base-app.js');
        await import('../applications/status/status.js');
    });

    beforeEach(() => {
        document.body.innerHTML = statusDom();
        delete window.WindowManager;
    });

    it('openStatusWindow opens StatusApp when present', () => {
        const app = new window.StatusAppClass();
        window.StatusApp = app;
        const openSpy = vi.spyOn(app, 'open');
        window.openStatusWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openStatusWindow no-ops when StatusApp is missing', () => {
        window.StatusApp = undefined;
        expect(() => window.openStatusWindow()).not.toThrow();
    });

    it('open loads the iframe only when the window is opened', () => {
        document.body.innerHTML = `
            ${statusDom()}
            <iframe id="status-iframe" data-src="https://status.nullstar.fun/" src="about:blank"></iframe>
        `;
        const app = new window.StatusAppClass();
        const iframe = document.getElementById('status-iframe');
        expect(iframe.getAttribute('src')).toBe('about:blank');
        app.open();
        expect(iframe.getAttribute('src')).toBe('https://status.nullstar.fun/');
        app.open();
        expect(iframe.getAttribute('src')).toBe('https://status.nullstar.fun/');
    });

    it('ensureIframeSrc no-ops without an iframe or data-src', () => {
        const app = new window.StatusAppClass();
        expect(() => app.ensureIframeSrc()).not.toThrow();
        document.body.innerHTML = `${statusDom()}<iframe id="status-iframe" src="about:blank"></iframe>`;
        new window.StatusAppClass().ensureIframeSrc();
        expect(document.getElementById('status-iframe').getAttribute('src')).toBe('about:blank');
    });
});
