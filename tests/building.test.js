/**
 * Building window – desktop icon, lazy iframe and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const buildingDom = () => `
    <div id="building-window" class="window" style="display: none;"></div>
    <a id="building-desktop-icon" class="desktop-icon"></a>
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
