/**
 * Building window – desktop icon, lazy iframe and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const buildingDom = () => `
    <div id="building-window" class="window" style="display: none;"></div>
    <a id="building-desktop-icon" class="desktop-icon"></a>
    <a id="building-dock-item" class="dock-item"></a>
`;

describe('BuildingApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = buildingDom();
        await import('../core/base-app.js');
        await import('../applications/building/building.js');
    });

    beforeEach(() => {
        document.body.innerHTML = buildingDom();
        delete window.WindowManager;
    });

    it('desktop icon click opens the building window', () => {
        const app = new window.BuildingAppClass();
        const openSpy = vi.spyOn(app, 'open');
        document.getElementById('building-desktop-icon').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(openSpy).toHaveBeenCalled();
    });

    it('in matrix mode the desktop icon opens the building site in a new window instead', () => {
        document.body.innerHTML = `
            ${buildingDom()}
            <iframe id="building-iframe" data-src="https://nullstar.games/" src="about:blank"></iframe>
        `;
        window.MatrixTheme = { isMatrixTheme: () => true };
        const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
        vi.useFakeTimers();
        try {
            const app = new window.BuildingAppClass();
            const iframeOpen = vi.spyOn(app, 'ensureIframeSrc');
            const icon = document.getElementById('building-desktop-icon');
            icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(icon.classList.contains('is-opening')).toBe(true);
            expect(windowOpen).not.toHaveBeenCalled();
            vi.advanceTimersByTime(700);
            expect(windowOpen).toHaveBeenCalledWith('https://nullstar.games/', '_blank', 'noopener');
            expect(iframeOpen).not.toHaveBeenCalled();
            expect(icon.classList.contains('is-opening')).toBe(true);
            vi.advanceTimersByTime(3000);
            expect(icon.classList.contains('is-opening')).toBe(false);
        } finally {
            vi.useRealTimers();
            windowOpen.mockRestore();
            delete window.MatrixTheme;
        }
    });

    it('dock item click opens the building window once and marks the item active', () => {
        const app = new window.BuildingAppClass();
        const openSpy = vi.spyOn(app, 'open');
        const dockItem = document.getElementById('building-dock-item');
        dockItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(openSpy).toHaveBeenCalledTimes(1);
        expect(dockItem.classList.contains('active')).toBe(true);
    });

    it('openBuildingWindow opens BuildingApp when present', () => {
        const app = new window.BuildingAppClass();
        window.BuildingApp = app;
        const openSpy = vi.spyOn(app, 'open');
        window.openBuildingWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openBuildingWindow no-ops when BuildingApp is missing', () => {
        window.BuildingApp = undefined;
        expect(() => window.openBuildingWindow()).not.toThrow();
    });

    it('open loads the iframe only when the window is opened', () => {
        document.body.innerHTML = `
            ${buildingDom()}
            <iframe id="building-iframe" data-src="https://nullstar.games/" src="about:blank"></iframe>
        `;
        const app = new window.BuildingAppClass();
        const iframe = document.getElementById('building-iframe');
        expect(iframe.getAttribute('src')).toBe('about:blank');
        app.open();
        expect(iframe.getAttribute('src')).toBe('https://nullstar.games/');
        app.open();
        expect(iframe.getAttribute('src')).toBe('https://nullstar.games/');
    });

    it('ensureIframeSrc no-ops without an iframe or data-src', () => {
        const app = new window.BuildingAppClass();
        expect(() => app.ensureIframeSrc()).not.toThrow();
        document.body.innerHTML = `${buildingDom()}<iframe id="building-iframe" src="about:blank"></iframe>`;
        new window.BuildingAppClass().ensureIframeSrc();
        expect(document.getElementById('building-iframe').getAttribute('src')).toBe('about:blank');
    });
});
